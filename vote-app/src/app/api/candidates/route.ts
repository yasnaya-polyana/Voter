import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Campaign from '../../../models/Campaign';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { campaignId, candidates } = body;
    
    console.log('API Route - Received request:', {
      campaignId,
      candidates
    });

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    if (!candidates || !Array.isArray(candidates)) {
      return NextResponse.json(
        { error: 'Invalid candidates data' },
        { status: 400 }
      );
    }

    // Find campaign by the generated ID
    const campaign = await Campaign.findOne({ id: campaignId });
    console.log('API Route - Found campaign:', campaign);

    if (!campaign) {
      console.log('API Route - Campaign not found:', campaignId);
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Add candidates and update status
    campaign.candidates = candidates;
    campaign.status = 'active';

    const updatedCampaign = await campaign.save();
    console.log('API Route - Updated campaign:', updatedCampaign);

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error('API Route - Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add candidates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 