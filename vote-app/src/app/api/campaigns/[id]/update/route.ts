import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import mongoose from 'mongoose';

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

    const updateData = await request.json();
    console.log('Updating campaign with data:', updateData);
    
    const campaign = await Campaign.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    );
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign._id,
        blockchainTxHash: campaign.blockchainTxHash
      }
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}
