import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import Vote from '@/models/Vote';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const campaignId = params.id;
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    // Find the campaign
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    // Delete all votes for this campaign
    const deletedVotes = await Vote.deleteMany({ campaignId });
    
    // Delete the campaign
    await Campaign.findByIdAndDelete(campaignId);
    
    return NextResponse.json({
      success: true,
      message: `Campaign "${campaign.campaignName}" deleted successfully`,
      stats: {
        votesDeleted: deletedVotes.deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}

// Get campaign details with vote statistics
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const campaignId = params.id;
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    // Find the campaign
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    // Get vote statistics
    const voteCount = await Vote.countDocuments({ campaignId });
    
    // Get vote distribution by time
    const votes = await Vote.find({ campaignId }).select('voteDate createdAt');
    
    // Group votes by day
    const votesByDay = {};
    votes.forEach(vote => {
      const date = new Date(vote.voteDate || vote.createdAt);
      const day = date.toISOString().split('T')[0];
      votesByDay[day] = (votesByDay[day] || 0) + 1;
    });
    
    // Convert to array for easier consumption
    const voteTimeline = Object.entries(votesByDay).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign._id,
        name: campaign.campaignName,
        description: campaign.description,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status,
        isPublic: campaign.isPublic,
        createdBy: campaign.createdBy,
        totalVotes: campaign.totalVotes,
        candidates: campaign.candidates.map(c => ({
          id: c._id,
          name: c.name,
          description: c.description,
          voteCount: c.voteCount || 0
        })),
        stats: {
          voteCount,
          voteTimeline
        }
      }
    });
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaign details' },
      { status: 500 }
    );
  }
} 