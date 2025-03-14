import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import Vote from '@/models/Vote';
import mongoose from 'mongoose';
import { getServerKeyStore, serverNearConfig } from '@/lib/near-server-config';
import { connect } from 'near-api-js';

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

    const { 
      candidateId, 
      candidateName, 
      candidateIndex, 
      publicKey, 
      privateKey, 
      voterAccountId 
    } = await request.json();
    
    console.log('Vote request received:', { 
      campaignId: params.id,
      candidateId, 
      candidateName,
      candidateIndex,
      hasPrivateKey: !!privateKey, 
      voterAccountId,
      publicKey
    });

    if (!voterAccountId) {
      return NextResponse.json(
        { error: 'Voter account ID is required' },
        { status: 400 }
      );
    }

    // Find the campaign
    const campaign = await Campaign.findById(params.id);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    console.log('Campaign found:', {
      id: campaign._id,
      name: campaign.name || campaign.campaignName,
      candidatesCount: campaign.candidates?.length || 0
    });

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

    // Find the candidate using multiple methods
    let candidate;
    
    // Log all candidates to debug
    console.log('Available candidates:', campaign.candidates.map((c, i) => ({
      index: i,
      id: c._id?.toString(),
      name: c.name
    })));
    
    if (mongoose.Types.ObjectId.isValid(candidateId)) {
      candidate = campaign.candidates.find(c => 
        c._id.toString() === candidateId
      );
    } 
    
    // If not found by ID, try by name
    if (!candidate && candidateName) {
      candidate = campaign.candidates.find(c => 
        c.name === candidateName
      );
    }
    
    // If still not found, try by index
    if (!candidate && candidateIndex !== undefined) {
      candidate = campaign.candidates[candidateIndex];
    }
    
    // Last resort: just use the first candidate with the matching ID string
    if (!candidate) {
      // If we still can't find the candidate, create a fallback using the provided name
      if (candidateName) {
        console.log('Creating fallback candidate with name:', candidateName);
        candidate = { 
          name: candidateName,
          _id: candidateId || 'unknown'
        };
      } else {
        return NextResponse.json(
          { error: `Candidate not found with ID: ${candidateId}` },
          { status: 404 }
        );
      }
    }
    
    console.log('Candidate found or created:', {
      id: candidate._id,
      name: candidate.name
    });

    // Check if the voter has already voted in this campaign
    const existingVote = await Vote.findOne({
      campaignId: params.id,
      userId: voterAccountId
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted in this campaign' },
        { status: 400 }
      );
    }

    // Create a vote record in the database
    const vote = new Vote({
      campaignId: params.id,
      userId: voterAccountId,
      candidateVotedFor: candidate._id.toString(),
      candidateName: candidate.name,
      campaignName: campaign.name || campaign.campaignName,
      status: 'completed',
      voteDate: new Date(),
      publicKey: publicKey
    });

    await vote.save();
    console.log('Vote saved to database');

    // Try to record the vote on the blockchain if configured
    if (campaign.blockchainId) {
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
          candidate_id: candidateName,
          public_key: publicKey
        });
        
        // Cast the vote on the blockchain
        await account.functionCall({
          contractId: serverNearConfig.contractName,
          methodName: 'cast_vote',
          args: {
            campaign_id: campaign.blockchainId,
            candidate_id: candidateName,
            public_key: publicKey
          },
          gas: serverNearConfig.GAS,
          attachedDeposit: serverNearConfig.attachedDeposit
        });
        
        console.log('Vote cast on blockchain successfully');
      } catch (blockchainError) {
        console.error('Error casting vote on blockchain:', blockchainError);
        // Continue even if blockchain vote fails - we've already saved to our database
      }
    } else {
      console.log('Campaign has no blockchain ID, skipping blockchain vote');
    }

    return NextResponse.json({
      success: true,
      message: 'Vote cast successfully'
    });
  } catch (error: any) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cast vote' },
      { status: 500 }
    );
  }
} 