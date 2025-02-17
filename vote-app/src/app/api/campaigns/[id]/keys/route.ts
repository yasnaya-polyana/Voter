import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Campaign from '../../../../../models/Campaign';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { publicKey, privateKey, isPublic } = await request.json();

    const campaign = await Campaign.findById(params.id);
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Only update relevant keys based on campaign type
    const updateData = isPublic ? 
      { publicKey } : 
      { publicKey, privateKey };

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign keys:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign keys' },
      { status: 500 }
    );
  }
} 