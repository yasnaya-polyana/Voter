import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Campaign from '../../../../models/Campaign';
import mongoose from 'mongoose';

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

    const campaign = await Campaign.findById(params.id);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Format the dates properly
    const formattedCampaign = {
      _id: campaign._id,
      campaignName: campaign.campaignName,
      description: campaign.description,
      isPublic: campaign.isPublic,
      publicKey: campaign.publicKey,
      privateKey: campaign.privateKey,
      startDate: campaign.startDate.toISOString(),
      endDate: campaign.endDate.toISOString(),
      status: campaign.status,
      candidates: campaign.candidates.map(candidate => ({
        _id: candidate._id,
        name: candidate.name,
        description: candidate.description,
        voteCount: candidate.voteCount || 0
      })),
      totalVotes: campaign.totalVotes || 0,
      announcements: campaign.announcements || [],
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt
    };

    return NextResponse.json(formattedCampaign);

  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const updates = await request.json();
    
    const campaign = await Campaign.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);

  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
} 