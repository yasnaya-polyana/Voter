import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import mongoose from 'mongoose';
import { getContract } from '@/lib/near-contract';
import { connect, keyStores } from 'near-api-js';
import { nearConfig } from '@/lib/near-config';
import { getServerKeyStore, serverNearConfig } from '@/lib/near-server-config';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    const { candidateId, publicKey, privateKey } = await request.json();
    console.log('Vote request received:', { candidateId, hasPrivateKey: !!privateKey });

    // Find the campaign
    const campaign = await Campaign.findById(params.id);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Verify campaign is active
    if (campaign.status !== 'active') {
      return NextResponse.json(
        { error: 'Campaign is not active' },
        { status: 400 }
      );
    }

    // Verify public key
    if (campaign.publicKey !== publicKey) {
      return NextResponse.json(
        { error: 'Invalid public key' },
        { status: 400 }
      );
    }

    // For private campaigns, verify private key
    if (!campaign.isPublic) {
      if (!privateKey) {
        return NextResponse.json(
          { error: 'Private key required for private campaigns' },
          { status: 400 }
        );
      }
      
      if (campaign.privateKey?.toLowerCase() !== privateKey.toLowerCase()) {
        console.log('Private key mismatch');
        return NextResponse.json(
          { error: 'Invalid private key' },
          { status: 400 }
        );
      }
    }

    // Find the candidate
    const candidate = campaign.candidates.id(candidateId);
    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Check if blockchain ID exists
    if (!campaign.blockchainId) {
      console.error('Campaign has no blockchain ID:', campaign._id);
      return NextResponse.json(
        { error: 'Campaign not properly configured for blockchain' },
        { status: 500 }
      );
    }

    // Now interact with the blockchain
    try {
      // Get the key store with the account credentials
      const keyStore = await getServerKeyStore();
      
      // Connect to NEAR with the key store
      const near = await connect({
        ...serverNearConfig,
        keyStore,
        headers: {}
      });
      
      // Get the account
      const account = await near.account(serverNearConfig.accountId);
      
      // Get the candidate name instead of ID
      const candidateName = candidate.name;
      
      console.log('Casting vote on blockchain with args:', {
        campaign_id: campaign.blockchainId,
        candidate_id: candidateName,  // Use the name as the ID
        public_key: publicKey
      });
      
      // Cast the vote on the blockchain
      await account.functionCall({
        contractId: serverNearConfig.contractName,
        methodName: 'cast_vote',
        args: {
          campaign_id: campaign.blockchainId,
          candidate_id: candidateName,  // Use the name as the ID
          public_key: publicKey
        },
        gas: serverNearConfig.GAS,
        attachedDeposit: serverNearConfig.attachedDeposit
      });
      
      console.log('Vote cast on blockchain successfully');
    } catch (blockchainError) {
      console.error('Error casting vote on blockchain:', blockchainError);
      // You might want to continue even if blockchain vote fails
      // Or return an error depending on your requirements
    }

    // Increment vote count in MongoDB
    candidate.voteCount = (candidate.voteCount || 0) + 1;
    campaign.totalVotes = (campaign.totalVotes || 0) + 1;
    
    await campaign.save();

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully',
      voteCount: candidate.voteCount,
      totalVotes: campaign.totalVotes
    });

  } catch (error: any) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process vote' },
      { status: 500 }
    );
  }
} 