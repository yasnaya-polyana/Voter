import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Campaign from '../../../../models/Campaign';

export async function GET() {
  try {
    await dbConnect();
    console.log('Fetching all campaigns (including non-active)');
    
    const campaigns = await Campaign.find({})
      .sort({ createdAt: -1 })
      .select('campaignName description startDate endDate status isPublic totalVotes publicKey createdBy candidates blockchainId blockchainTxHash');

    console.log(`Found ${campaigns.length} total campaigns`);
    
    const currentDate = new Date();
    
    const updatedCampaigns = campaigns.map(campaign => {
      const campaignData = campaign.toObject();
      
      // Calculate status based on dates
      let status = campaignData.status || 'draft';
      if (currentDate < new Date(campaign.startDate)) {
        status = 'upcoming';
      } else if (currentDate > new Date(campaign.endDate)) {
        status = 'ended';
      } else {
        status = 'active';
      }
      
      // Log the createdBy field to help with debugging
      console.log(`Campaign ${campaignData._id} createdBy: ${campaignData.createdBy}`);
      
      return {
        ...campaignData,
        id: campaignData._id,
        status,
        candidateCount: campaign.candidates?.length || 0
      };
    });

    return NextResponse.json(updatedCampaigns);
  } catch (error) {
    console.error('Error fetching all campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
} 