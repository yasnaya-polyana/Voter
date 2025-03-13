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
    
    if (!candidates || !Array.isArray(candidates)) {
      return NextResponse.json(
        { error: 'Candidates array is required' },
        { status: 400 }
      );
    }

    // Find the campaign
    const campaign = await Campaign.findById(params.id);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Add blockchain IDs to candidates
    const candidatesWithBlockchainIds = candidates.map((candidate, index) => ({
      ...candidate,
      blockchainId: `candidate_${index + 1}` // Simple numeric IDs for blockchain
    }));
    
    // Add candidates to the campaign
    campaign.candidates = candidatesWithBlockchainIds;
    
    // Save the campaign
    await campaign.save();

    return NextResponse.json({
      success: true,
      message: 'Candidates added successfully',
      candidates: campaign.candidates
    });
  } catch (error: any) {
    console.error('Error adding candidates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add candidates' },
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
