import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Campaign from '@/models/Campaign';
import dbConnect from '@/lib/mongodb';

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
    
    return NextResponse.json({
      id: campaign._id,
      name: campaign.campaignName,
      status: campaign.status,
      hasBlockchainId: !!campaign.blockchainId,
      blockchainId: campaign.blockchainId,
      hasBlockchainTxHash: !!campaign.blockchainTxHash,
      blockchainTxHash: campaign.blockchainTxHash
    });
  } catch (error) {
    console.error('Error fetching campaign status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign status' },
      { status: 500 }
    );
  }
}
