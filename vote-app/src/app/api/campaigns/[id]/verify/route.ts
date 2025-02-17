import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Campaign from '../../../../../models/Campaign';
import mongoose from 'mongoose';
import crypto from 'crypto';

function hashPrivateKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { privateKey } = await request.json();
    
    // Add debug logging
    console.log('Verifying keys:', {
      campaignId: params.id,
      hasPrivateKey: !!privateKey
    });

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    // Find the campaign
    const campaign = await Campaign.findById(params.id);
    
    // Log campaign details (without exposing full keys)
    console.log('Campaign found:', {
      id: campaign?._id,
      isPublic: campaign?.isPublic,
      hasStoredPrivateKey: !!campaign?.privateKey
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // For private campaigns, verify private key
    if (!campaign.isPublic) {
      if (!privateKey) {
        return NextResponse.json(
          { error: 'Private key required for private campaigns' },
          { status: 400 }
        );
      }
      
      // Compare keys directly (case-insensitive)
      console.log('Key comparison:', {
        providedKey: privateKey.slice(-6),
        storedKey: campaign.privateKey?.slice(-6)
      });

      if (campaign.privateKey?.toLowerCase() !== privateKey.toLowerCase()) {
        return NextResponse.json(
          { error: 'Invalid private key' },
          { status: 400 }
        );
      }
    }

    // If we get here, the keys are valid
    return NextResponse.json({
      success: true,
      message: 'Keys verified successfully',
      campaign: {
        id: campaign._id,
        name: campaign.campaignName,
        isPublic: campaign.isPublic,
        status: campaign.status,
        candidates: campaign.candidates
      }
    });

  } catch (error) {
    console.error('Error verifying keys:', error);
    return NextResponse.json(
      { error: 'Failed to verify keys' },
      { status: 500 }
    );
  }
} 