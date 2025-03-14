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
        
        return {
          campaignId: vote.campaignId.toString(),
          campaignName: vote.campaignName || (campaign ? campaign.name || campaign.campaignName : 'Unknown Campaign'),
          candidateVoted: vote.candidateName,
          voteDate: vote.voteDate || vote.createdAt,
          publicKey: campaign ? campaign.publicKey : '',
        };
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