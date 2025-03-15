import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Campaign from '../../../../../models/Campaign';
import mongoose from 'mongoose';

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

    const { privateKey } = await request.json();

    if (!privateKey) {
      return NextResponse.json(
        { error: 'Private key is required', valid: false },
        { status: 400 }
      );
    }

    const campaign = await Campaign.findById(params.id);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found', valid: false },
        { status: 404 }
      );
    }

    // If campaign is public, no need for private key
    if (campaign.isPublic) {
      return NextResponse.json({ valid: true });
    }

    // If campaign is private but has no private key set
    if (!campaign.privateKey) {
      return NextResponse.json(
        { error: 'This campaign is misconfigured (no private key set)', valid: false },
        { status: 400 }
      );
    }

    // Check if the provided private key matches
    const isValid = campaign.privateKey.toLowerCase() === privateKey.toLowerCase();

    if (!isValid) {
      // For security, don't provide too much information about why it failed
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({ valid: true });

  } catch (error) {
    console.error('Error verifying private key:', error);
    return NextResponse.json(
      { error: 'Failed to verify private key', valid: false },
      { status: 500 }
    );
  }
} 