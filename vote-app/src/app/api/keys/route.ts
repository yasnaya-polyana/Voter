import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Campaign from '../../../models/Campaign';
import crypto from 'crypto';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { campaignId } = await req.json();

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Generate a key pair
    const publicKey = crypto.randomBytes(32).toString('hex');
    const privateKey = crypto.randomBytes(32).toString('hex');

    console.log('Generating keys for campaign:', campaignId); // Debug log

    // Find and update the campaign with the public key
    const campaign = await Campaign.findOneAndUpdate(
      { id: campaignId },
      { 
        $set: { 
          publicKey,
          privateKey,
          status: 'active'
        }
      },
      { new: true }
    );

    if (!campaign) {
      console.log('Campaign not found:', campaignId); // Debug log
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    console.log('Keys generated successfully for campaign:', campaignId); // Debug log
    return NextResponse.json({ publicKey, privateKey });
  } catch (error) {
    console.error('Error generating keys:', error);
    return NextResponse.json(
      { error: 'Failed to generate keys' },
      { status: 500 }
    );
  }
} 