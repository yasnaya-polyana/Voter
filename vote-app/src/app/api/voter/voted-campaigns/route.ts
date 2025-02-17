import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Campaign from '../../../../models/Campaign';
import Vote from '../../../../models/Vote';

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Get the user ID from the session
    // This is a placeholder - implement your actual auth check
    const userId = 'current-user-id';

    // Find all votes by the user
    const userVotes = await Vote.find({ userId });

    // Get all campaigns the user has voted in
    const votedCampaigns = await Campaign.find({
      _id: { $in: userVotes.map(vote => vote.campaignId) },
      endDate: { $lt: new Date() } // Only show completed campaigns
    }).sort({ endDate: -1 }); // Most recent first

    // Calculate results and add user's vote information
    const campaignsWithResults = await Promise.all(
      votedCampaigns.map(async (campaign) => {
        const campaignVotes = await Vote.find({ campaignId: campaign._id });
        const userVote = userVotes.find(
          vote => vote.campaignId.toString() === campaign._id.toString()
        );

        const candidatesWithVotes = campaign.candidates.map(candidate => {
          const voteCount = campaignVotes.filter(
            vote => vote.candidateId.toString() === candidate._id.toString()
          ).length;

          return {
            id: candidate._id,
            name: candidate.name,
            description: candidate.description,
            voteCount
          };
        });

        return {
          id: campaign._id,
          campaignName: campaign.name,
          description: campaign.description,
          endDate: campaign.endDate,
          candidates: candidatesWithVotes,
          totalVotes: campaignVotes.length,
          userVote: userVote?.candidateId
        };
      })
    );

    return NextResponse.json(campaignsWithResults);
  } catch (error) {
    console.error('Error fetching voted campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voting history' },
      { status: 500 }
    );
  }
} 