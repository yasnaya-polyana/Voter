import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Campaign from '../../../models/Campaign';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';
import { connect, keyStores, KeyPair } from 'near-api-js';
import { nearConfig } from '../../../lib/near-config';
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

function generateBlockchainId(): string {
  // Generate a simple ID for the blockchain (timestamp + random string)
  return `campaign_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const data = await request.json();
    const publicKey = generatePublicKey();
    const privateKey = !data.isPublic ? generatePrivateKey() : undefined;
    
    // Generate a blockchain ID
    const blockchainId = generateBlockchainId();
    
    console.log('Creating campaign with blockchain ID:', blockchainId);

    // Create campaign in MongoDB
    const campaign = await Campaign.create({
      ...data,
      publicKey,
      privateKey,
      status: 'draft',
      blockchainId
    });

    // Now create the campaign on the blockchain
    try {
      // For server-side operations, we need to use a different approach
      // since we can't use the user's wallet directly
      
      // This is just a flag to indicate blockchain creation is needed
      // The actual blockchain creation will happen from the frontend
      console.log('Campaign created in MongoDB. Blockchain creation will be handled by frontend.');
      
      return NextResponse.json({
        success: true,
        campaign: {
          id: campaign._id,
          token: campaign._id,
          publicKey,
          privateKey,
          status: 'draft',
          blockchainId,
          needsBlockchainCreation: true // Flag to indicate blockchain creation is needed
        }
      });
    } catch (blockchainError) {
      console.error('Error preparing for blockchain creation:', blockchainError);
      // Continue anyway since we've created the MongoDB record
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign._id,
        token: campaign._id,
        publicKey,
        privateKey,
        status: 'draft',
        blockchainId,
        needsBlockchainCreation: true
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
      
      return {
        ...campaignData,
        id: campaignData._id
      };
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
