import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';

export async function GET(
  request: Request,
  { params }: { params: { publicKey: string } }
) {
  try {
    await dbConnect();
    
    const publicKey = params.publicKey;
    if (!publicKey) {
      return NextResponse.json(
        { error: 'Public key is required' },
        { status: 400 }
      );
    }

    // Find the campaign by public key
    const campaign = await Campaign.findOne({ publicKey });
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Return campaign data
    return NextResponse.json({
      id: campaign._id.toString(),
      name: campaign.name,
      description: campaign.description,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      isPublic: campaign.isPublic,
      publicKey: campaign.publicKey,
      blockchainId: campaign.blockchainId,
      blockchainTxHash: campaign.blockchainTxHash,
      candidates: campaign.candidates
    });
  } catch (error: any) {
    console.error('Error fetching campaign by public key:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
} 