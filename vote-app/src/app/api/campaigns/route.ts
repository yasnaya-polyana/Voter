import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Campaign from '../../../models/Campaign';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';
// 18471272
// d07dd0c99f2d1ed519ddf59444126aff50a09ff8baba7929d86191cf2017a006


function generatePublicKey(length: number = 8): string {
  // Generate 8-digit public key
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generatePrivateKey(): string {
  // Generate a cryptographically secure private key using random bytes
  return crypto.randomBytes(32).toString('hex');
}

function hashPrivateKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const data = await request.json();
    const publicKey = generatePublicKey();
    
    // Generate private key for private campaigns
    const privateKey = !data.isPublic ? generatePrivateKey() : undefined;

    // Debug log
    console.log('Creating campaign:', {
      isPublic: data.isPublic,
      hasPrivateKey: !!privateKey,
    });

    // Create campaign - store the private key directly for private campaigns
    const campaign = await Campaign.create({
      ...data,
      publicKey,
      privateKey, // Store the private key directly, not hashed
      status: 'draft'
    });

    // Debug log
    console.log('Campaign created:', {
      id: campaign._id,
      isPublic: campaign.isPublic,
      hasStoredPrivateKey: !!campaign.privateKey
    });

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign._id,
        token: campaign._id,
        publicKey,
        privateKey, // Return the same private key
        status: 'draft'
      }
    });

  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const currentDate = new Date();

    const campaigns = await Campaign.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    })
    .sort({ createdAt: -1 })
    .select('campaignName description startDate endDate status isPublic totalVotes');

    const updatedCampaigns = campaigns.map(campaign => {
      const campaignData = campaign.toObject();
      
      if (currentDate < new Date(campaign.startDate)) {
        campaignData.status = 'upcoming';
      } else if (currentDate > new Date(campaign.endDate)) {
        campaignData.status = 'ended';
      } else {
        campaignData.status = 'active';
      }

      return campaignData;
    });

    return NextResponse.json(updatedCampaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
