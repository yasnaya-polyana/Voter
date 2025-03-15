import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import Vote from '@/models/Vote';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    // Get counts
    const totalCampaigns = await Campaign.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Get user type distribution
    const userTypes = await User.aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } }
    ]);
    
    const userTypeDistribution = userTypes.reduce((acc, type) => {
      acc[type._id] = type.count;
      return acc;
    }, {});
    
    // Get campaign status distribution
    const campaignStatuses = await Campaign.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const campaignStatusDistribution = campaignStatuses.reduce((acc, status) => {
      acc[status._id] = status.count;
      return acc;
    }, {});
    
    // Get vote timeline (votes per day)
    const votes = await Vote.find().select('voteDate createdAt');
    
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
    
    // Get top campaigns by votes
    const topCampaigns = await Campaign.find()
      .sort({ totalVotes: -1 })
      .limit(5)
      .select('campaignName totalVotes');
    
    // Get recent activity
    const recentVotes = await Vote.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('campaignName candidateName voteDate createdAt');
    
    const recentCampaigns = await Campaign.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('campaignName createdBy createdAt');
    
    return NextResponse.json({
      success: true,
      stats: {
        counts: {
          totalCampaigns,
          totalVotes,
          totalUsers
        },
        distributions: {
          userTypes: userTypeDistribution,
          campaignStatuses: campaignStatusDistribution
        },
        timelines: {
          votes: voteTimeline
        },
        topCampaigns: topCampaigns.map(c => ({
          id: c._id,
          name: c.campaignName,
          totalVotes: c.totalVotes || 0
        })),
        recentActivity: {
          votes: recentVotes.map(v => ({
            id: v._id,
            campaignName: v.campaignName,
            candidateName: v.candidateName,
            date: v.voteDate || v.createdAt
          })),
          campaigns: recentCampaigns.map(c => ({
            id: c._id,
            name: c.campaignName,
            createdBy: c.createdBy,
            date: c.createdAt
          }))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching system statistics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch system statistics' },
      { status: 500 }
    );
  }
} 