import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Campaign from '../../../../../models/Campaign';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await dbConnect();
    
    // Get all campaigns for this user, regardless of status
    const campaigns = await Campaign.find({ createdBy: params.userId })
      .select('campaignName description startDate endDate isPublic totalVotes publicKey candidates blockchainId blockchainTxHash')
      .sort({ createdAt: -1 });

    // Calculate current status for each campaign
    const currentDate = new Date();
    
    // Map the campaigns to include proper fields
    const mappedCampaigns = campaigns.map(campaign => {
      let status = 'draft';
      const start = new Date(campaign.startDate);
      const end = new Date(campaign.endDate);
      
      if (currentDate < start) {
        status = 'upcoming';
      } else if (currentDate > end) {
        status = 'ended';
      } else {
        status = 'active';
      }
      
      return {
        _id: campaign._id.toString(),
        campaignName: campaign.campaignName,
        description: campaign.description || '',
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        isPublic: campaign.isPublic,
        totalVotes: campaign.totalVotes || 0,
        publicKey: campaign.publicKey,
        status,
        createdBy: params.userId,
        candidateCount: campaign.candidates?.length || 0,
        blockchainId: campaign.blockchainId,
        blockchainTxHash: campaign.blockchainTxHash
      };
    });

    return NextResponse.json(mappedCampaigns);

  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
} 