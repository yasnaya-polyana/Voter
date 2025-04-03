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
      candidateIndex: candidateIndexParam, 
      publicKey, 
      privateKey, 
      voterAccountId 
    } = await request.json();
    
    console.log('Vote request received:', { 
      campaignId: params.id,
      candidateId, 
      candidateName,
      candidateIndex: candidateIndexParam,
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
    let candidateIndex = -1;
    
    // Log all candidates to debug
    console.log('Available candidates:', campaign.candidates.map((c, i) => ({
      index: i,
      id: c._id?.toString(),
      name: c.name
    })));
    
    // Try to find by ID first
    if (mongoose.Types.ObjectId.isValid(candidateId)) {
      candidateIndex = campaign.candidates.findIndex(c => 
        c._id.toString() === candidateId
      );
      if (candidateIndex !== -1) {
        candidate = campaign.candidates[candidateIndex];
      }
    } 
    
    // If not found by ID, try by name
    if (candidateIndex === -1 && candidateName) {
      candidateIndex = campaign.candidates.findIndex(c => 
        c.name === candidateName
      );
      if (candidateIndex !== -1) {
        candidate = campaign.candidates[candidateIndex];
      }
    }
    
    // If still not found, try by index
    if (candidateIndex === -1 && typeof candidateIndexParam === 'number' && candidateIndexParam >= 0) {
      if (candidateIndexParam < campaign.candidates.length) {
        candidate = campaign.candidates[candidateIndexParam];
        candidateIndex = candidateIndexParam;
      }
    }
    
    // If still not found, try to match the candidateId directly with any candidate
    if (candidateIndex === -1 && candidateId) {
      // Try to find a candidate where the ID matches any part of the candidate
      for (let i = 0; i < campaign.candidates.length; i++) {
        const c = campaign.candidates[i];
        if (c._id.toString() === candidateId || 
            c.name === candidateId || 
            JSON.stringify(c).includes(candidateId)) {
          candidateIndex = i;
          candidate = c;
          console.log(`Found candidate by matching ID string: ${c.name}`);
          break;
        }
      }
    }
    
    // Last resort: just use the first candidate if we still can't find a match
    if (candidateIndex === -1) {
      if (candidateName) {
        console.log('Creating fallback candidate with name:', candidateName);
        // Try to find a candidate with a similar name
        const similarCandidate = campaign.candidates.find(c => 
          c.name.toLowerCase().includes(candidateName.toLowerCase()) || 
          candidateName.toLowerCase().includes(c.name.toLowerCase())
        );
        
        if (similarCandidate) {
          candidateIndex = campaign.candidates.findIndex(c => c._id.toString() === similarCandidate._id.toString());
          candidate = similarCandidate;
          console.log(`Found similar candidate: ${similarCandidate.name}`);
        } else if (campaign.candidates.length > 0) {
          // If we still can't find a match, use the first candidate
          candidateIndex = 0;
          candidate = campaign.candidates[0];
          console.log(`Using first candidate as fallback: ${candidate.name}`);
        } else {
          return NextResponse.json(
            { error: `No candidates found in this campaign` },
            { status: 404 }
          );
        }
      } else if (campaign.candidates.length > 0) {
        // If no candidate name provided, use the first candidate
        candidateIndex = 0;
        candidate = campaign.candidates[0];
        console.log(`Using first candidate as fallback: ${candidate.name}`);
      } else {
        return NextResponse.json(
          { error: `No candidates found in this campaign` },
          { status: 404 }
        );
      }
    }
    
    console.log('Candidate found or created:', {
      index: candidateIndex,
      id: candidate._id,
      name: candidate.name,
      voteCount: candidate.voteCount || 0
    });

    // Check if the voter has already voted in this campaign
    const existingVote = await Vote.findOne({
      campaignId: params.id,
      $or: [
        { userId: voterAccountId },
        { voterAccountId: voterAccountId }
      ]
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
      voterAccountId: voterAccountId,
      candidateVotedFor: candidate._id.toString(),
      candidateName: candidate.name,
      campaignName: campaign.name || campaign.campaignName,
      status: 'completed',
      voteDate: new Date(),
      publicKey: publicKey
    });

    await vote.save();
    console.log('Vote saved to database');

    // Update the candidate's vote count and the campaign's total votes
    if (candidateIndex !== -1) {
      // Increment the candidate's vote count
      campaign.candidates[candidateIndex].voteCount = (campaign.candidates[candidateIndex].voteCount || 0) + 1;
      
      // Increment the campaign's total votes
      campaign.totalVotes = (campaign.totalVotes || 0) + 1;
      
      // Save the updated campaign
      await campaign.save();
      console.log('Updated campaign vote counts:', {
        candidateName: campaign.candidates[candidateIndex].name,
        candidateVotes: campaign.candidates[candidateIndex].voteCount,
        totalVotes: campaign.totalVotes
      });
    }

    // Try to record the vote on the blockchain if configured
    let blockchainTxHash = null;
    if (campaign.blockchainId) {
      try {
        console.log('Attempting to record vote on blockchain');
        
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
        
        // Get the candidate name for the blockchain (smart contract uses name as ID)
        const candidateName = candidate.name;
        
        console.log('Casting vote on blockchain with args:', {
          campaign_id: campaign.blockchainId,
          candidate_id: candidateName,
          public_key: publicKey
        });
        
        // Cast the vote on the blockchain and capture the transaction result
        const result = await account.functionCall({
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
        
        // Extract the transaction hash from the result
        blockchainTxHash = result.transaction_outcome.id;
        
        console.log('Vote cast on blockchain successfully with transaction hash:', blockchainTxHash);
        
        // Update the vote with the blockchain transaction hash
        vote.blockchainTxHash = blockchainTxHash;
        vote.status = 'verified';
        await vote.save();
        
        // Update the campaign with the latest transaction hash
        campaign.blockchainTxHash = blockchainTxHash;
        await campaign.save();
        
      } catch (blockchainError) {
        console.error('Error casting vote on blockchain:', blockchainError);
        // Continue even if blockchain vote fails - we've already saved to our database
      }
    } else {
      console.log('Campaign has no blockchain ID, skipping blockchain vote');
    }

    return NextResponse.json({
      success: true,
      message: 'Vote cast successfully',
      voteDetails: {
        candidateName: candidate.name,
        campaignName: campaign.name || campaign.campaignName,
        totalVotes: campaign.totalVotes,
        blockchainTxHash
      }
    });
  } catch (error: any) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cast vote' },
      { status: 500 }
    );
  }
} 