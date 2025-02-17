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
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    const { candidateId, publicKey, privateKey } = await request.json();

    // Find the campaign
    const campaign = await Campaign.findById(params.id);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Verify campaign is active
    if (campaign.status !== 'active') {
      return NextResponse.json(
        { error: 'Campaign is not active' },
        { status: 400 }
      );
    }

    // Verify public key
    if (campaign.publicKey !== publicKey) {
      return NextResponse.json(
        { error: 'Invalid public key' },
        { status: 400 }
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
      
      // Hash the provided private key and compare with stored hash
      const hashedPrivateKey = hashPrivateKey(privateKey);
      if (campaign.privateKey !== hashedPrivateKey) {
        return NextResponse.json(
          { error: 'Invalid private key' },
          { status: 400 }
        );
      }
    }

    // Find and update the candidate's vote count
    const candidate = campaign.candidates.id(candidateId);
    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Increment vote count
    candidate.voteCount = (candidate.voteCount || 0) + 1;
    campaign.totalVotes = (campaign.totalVotes || 0) + 1;
    
    await campaign.save();

    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully'
    });

  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
} 