import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Campaign from '../../../../../models/Campaign';
import mongoose from 'mongoose';
import { getCampaignStatus } from '../../../../../utils/campaignStatus';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    const { candidates } = await request.json();

    const campaign = await Campaign.findById(params.id);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Update candidates
    campaign.candidates = candidates;

    // Calculate and update status
    const currentStatus = getCampaignStatus(campaign.startDate, campaign.endDate);
    campaign.status = currentStatus;

    await campaign.save();

    return NextResponse.json({
      success: true,
      candidates: campaign.candidates,
      status: campaign.status
    });

  } catch (error) {
    console.error('Error adding candidates:', error);
    return NextResponse.json(
      { error: 'Failed to add candidates' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve candidates
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    const campaign = await Campaign.findById(params.id)
      .select('candidates campaignName status');

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      candidates: campaign.candidates,
      campaignName: campaign.campaignName,
      status: campaign.status
    });

  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}
