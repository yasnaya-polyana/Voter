import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Vote from '@/models/Vote';
import Campaign from '@/models/Campaign';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // If the user is a campaign creator, find their campaigns
    if (user.userType === 'campaign') {
      const campaigns = await Campaign.find({ createdBy: user.email });
      
      // Delete all campaigns created by this user
      if (campaigns.length > 0) {
        console.log(`Deleting ${campaigns.length} campaigns created by user ${user.email}`);
        
        // Delete all votes for these campaigns
        for (const campaign of campaigns) {
          await Vote.deleteMany({ campaignId: campaign._id });
        }
        
        // Delete all campaigns
        await Campaign.deleteMany({ createdBy: user.email });
      }
    }
    
    // If the user is a voter, delete their votes
    if (user.userType === 'voter') {
      const votes = await Vote.find({ 
        $or: [
          { userId: userId },
          { voterAccountId: userId }
        ]
      });
      
      if (votes.length > 0) {
        console.log(`Deleting ${votes.length} votes cast by user ${user.email}`);
        await Vote.deleteMany({ 
          $or: [
            { userId: userId },
            { voterAccountId: userId }
          ]
        });
      }
    }
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    return NextResponse.json({
      success: true,
      message: `User ${user.email} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// Get user details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Find the user
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get additional user statistics
    let stats = {
      campaignsCreated: 0,
      votesCast: 0
    };
    
    if (user.userType === 'campaign') {
      stats.campaignsCreated = await Campaign.countDocuments({ createdBy: user.email });
    }
    
    if (user.userType === 'voter') {
      stats.votesCast = await Vote.countDocuments({ 
        $or: [
          { userId: userId },
          { voterAccountId: userId }
        ]
      });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        createdAt: user.createdAt,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user details' },
      { status: 500 }
    );
  }
} 