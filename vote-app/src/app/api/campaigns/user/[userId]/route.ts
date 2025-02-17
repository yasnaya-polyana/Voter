import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Campaign from '../../../../../models/Campaign';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await dbConnect();
    
    const campaigns = await Campaign.find({ createdBy: params.userId })
      .select('campaignName startDate endDate')
      .sort({ createdAt: -1 });

    // Map the campaigns to include proper fields
    const mappedCampaigns = campaigns.map(campaign => ({
      id: campaign._id.toString(),
      campaignName: campaign.campaignName,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      createdBy: campaign.createdBy
    }));

    return NextResponse.json(mappedCampaigns);

  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
} 