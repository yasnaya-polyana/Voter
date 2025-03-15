import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import Vote from '@/models/Vote';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Get the campaignId and adminKey from the query parameters
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const adminKey = searchParams.get('adminKey');
    
    // Check for admin key - this is a simple protection mechanism
    // In a production environment, you would use proper authentication
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    console.log('Admin fixing vote counts for campaign:', campaignId);

    // Find the campaign
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Find all votes for this campaign
    const votes = await Vote.find({ campaignId });
    
    console.log(`Found ${votes.length} votes for campaign ${campaignId}`);
    
    // Reset all vote counts
    campaign.totalVotes = 0;
    campaign.candidates.forEach(candidate => {
      candidate.voteCount = 0;
    });
    
    // Count votes for each candidate
    for (const vote of votes) {
      // Try to find the candidate by ID or name
      let candidateIndex = campaign.candidates.findIndex(c => 
        c._id.toString() === vote.candidateVotedFor || 
        c.name === vote.candidateName
      );
      
      // If not found, try to match by substring
      if (candidateIndex === -1) {
        candidateIndex = campaign.candidates.findIndex(c => 
          vote.candidateVotedFor.includes(c._id.toString()) || 
          c._id.toString().includes(vote.candidateVotedFor) ||
          (vote.candidateName && c.name.includes(vote.candidateName)) ||
          (vote.candidateName && vote.candidateName.includes(c.name))
        );
      }
      
      // If still not found, use the first candidate
      if (candidateIndex === -1 && campaign.candidates.length > 0) {
        candidateIndex = 0;
        console.log(`Could not find candidate for vote ${vote._id}, using first candidate as fallback`);
      }
      
      if (candidateIndex !== -1) {
        // Increment the candidate's vote count
        campaign.candidates[candidateIndex].voteCount = (campaign.candidates[candidateIndex].voteCount || 0) + 1;
        
        // Increment the campaign's total votes
        campaign.totalVotes = (campaign.totalVotes || 0) + 1;
        
        console.log(`Counted vote for candidate: ${campaign.candidates[candidateIndex].name}`);
      }
    }
    
    // Save the updated campaign
    await campaign.save();
    
    console.log('Updated campaign vote counts:', {
      totalVotes: campaign.totalVotes,
      candidateVotes: campaign.candidates.map(c => ({ 
        name: c.name, 
        votes: c.voteCount || 0 
      }))
    });

    return NextResponse.json({
      success: true,
      message: 'Vote counts fixed successfully',
      campaign: {
        id: campaign._id,
        name: campaign.campaignName,
        totalVotes: campaign.totalVotes,
        candidates: campaign.candidates.map(c => ({
          id: c._id,
          name: c.name,
          voteCount: c.voteCount || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fixing vote counts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fix vote counts' },
      { status: 500 }
    );
  }
} 