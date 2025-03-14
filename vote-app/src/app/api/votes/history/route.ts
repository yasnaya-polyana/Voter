import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vote from '@/models/Vote';
import Campaign from '@/models/Campaign';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Get the accountId from the query parameters
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const includeDetails = searchParams.get('includeDetails') === 'true';
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching voting history for account:', accountId);

    // Find all votes by this account - try both field names
    
    const votes = await Vote.find({ 
      $or: [
        { userId: accountId },
        { voterAccountId: accountId }
      ]
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${votes.length} votes for account ${accountId}`);
    
    // Get campaign details for each vote
    const history = await Promise.all(
      votes.map(async (vote) => {
        const campaign = await Campaign.findOne({ _id: vote.campaignId });
        
        if (!campaign) {
          console.log(`Campaign not found for vote: ${vote.campaignId}`);
        }
        
        const voteHistory = {
          campaignId: vote.campaignId.toString(),
          campaignName: vote.campaignName || (campaign ? campaign.name || campaign.campaignName : 'Unknown Campaign'),
          candidateVoted: vote.candidateName || vote.candidateVotedFor,
          voteDate: vote.voteDate || vote.createdAt,
          publicKey: campaign ? campaign.publicKey : '',
          status: vote.status,
          verificationHash: vote.verificationHash,
          blockchainTxHash: vote.blockchainTxHash || campaign?.blockchainTxHash,
          _id: vote._id.toString(),
        };

        // Include additional campaign details if requested
        if (includeDetails && campaign) {
          voteHistory.campaignDetails = {
            description: campaign.description,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            status: campaign.status,
            totalVotes: campaign.totalVotes,
            candidates: campaign.candidates.map(candidate => ({
              _id: candidate._id.toString(),
              name: candidate.name,
              description: candidate.description,
              voteCount: candidate.voteCount || 0
            }))
          };
        }
        
        return voteHistory;
      })
    );

    console.log('Returning history:', history);

    return NextResponse.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching voting history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch voting history' },
      { status: 500 }
    );
  }
} 