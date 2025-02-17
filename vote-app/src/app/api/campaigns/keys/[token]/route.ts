import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Campaign from '../../../../../models/Campaign';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    await dbConnect();

    // In a real application, you would verify the token's validity
    // For now, we'll just return the most recently created campaign
    const campaign = await Campaign.findOne()
      .sort({ createdAt: -1 })
      .select('campaignName isPublic publicKey privateKey');

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      campaignName: campaign.campaignName,
      isPublic: campaign.isPublic,
      publicKey: campaign.publicKey,
      privateKey: campaign.privateKey
    });

  } catch (error) {
    console.error('Error fetching campaign keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign keys' },
      { status: 500 }
    );
  }
} 