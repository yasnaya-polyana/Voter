import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Campaign from '../../../../models/Campaign';
import { getCampaignStatus } from '../../../../utils/campaignStatus';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { publicKey } = await request.json();
    
    // Remove the key formatting - keep original case
    const campaign = await Campaign.findOne({ 
      publicKey: publicKey
    });

    // Don't log sensitive information
    console.log('Searching for campaign:', campaign?._id);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Calculate current status
    const currentStatus = getCampaignStatus(campaign.startDate, campaign.endDate);

    // Update campaign status if it has changed
    if (campaign.status !== currentStatus) {
      await Campaign.findByIdAndUpdate(campaign._id, {
        status: currentStatus
      });
    }

    // Return the necessary campaign data without sensitive information
    return NextResponse.json({
      id: campaign._id,
      campaignName: campaign.campaignName,
      description: campaign.description,
      isPublic: campaign.isPublic,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      status: currentStatus,
      announcements: campaign.announcements || []
    });

  } catch (error) {
    console.error('Error accessing campaign');
    return NextResponse.json(
      { error: 'Failed to access campaign' },
      { status: 500 }
    );
  }
} 