import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import mongoose from 'mongoose';
import { connect } from 'near-api-js';
import { getServerKeyStore, serverNearConfig } from '@/lib/near-server-config';

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

    // Add candidates to the campaign
    campaign.candidates = candidates;
    
    // Save the campaign
    await campaign.save();

    // If the campaign has a blockchain ID, create it on the blockchain
    if (campaign.blockchainId) {
      try {
        // Get the key store with the account credentials
        const keyStore = await getServerKeyStore();
        
        // Connect to NEAR with the key store
        const near = await connect({
          ...serverNearConfig,
          keyStore,
          headers: {}
        });
        
        // Get the account
        const account = await near.account(serverNearConfig.accountId);
        
        // Convert candidates to string array (names only)
        const candidateNames = candidates.map(c => String(c.name));
        
        // Get dates
        const startDate = campaign.startDate.getTime().toString();
        const endDate = campaign.endDate.getTime().toString();
        
        console.log('Creating campaign on blockchain after adding candidates:', {
          campaign_id: campaign.blockchainId,
          title: campaign.campaignName,
          description: campaign.description || `Campaign: ${campaign.campaignName}`,
          candidates: candidateNames,
          start_date: startDate,
          end_date: endDate,
          is_public: campaign.isPublic
        });
        
        // Call the create_campaign method with the correct parameters
        const result = await account.functionCall({
          contractId: serverNearConfig.contractName,
          methodName: 'create_campaign',
          args: {
            campaign_id: campaign.blockchainId,
            title: campaign.campaignName,
            description: campaign.description || `Campaign: ${campaign.campaignName}`,
            candidates: candidateNames,
            start_date: startDate,
            end_date: endDate,
            is_public: campaign.isPublic
          },
          gas: serverNearConfig.GAS,
          attachedDeposit: serverNearConfig.attachedDeposit
        });
        
        console.log('Campaign created on blockchain:', result);
        
        // Update the campaign with the transaction hash
        campaign.blockchainTxHash = result.transaction_outcome.id;
        campaign.status = 'active';
        await campaign.save();
        
        return NextResponse.json({
          success: true,
          message: 'Candidates added and campaign created on blockchain',
          candidates: campaign.candidates,
          blockchainTxHash: campaign.blockchainTxHash,
          explorerUrl: `${serverNearConfig.explorerUrl}/transactions/${campaign.blockchainTxHash}`
        });
      } catch (blockchainError) {
        console.error('Error creating campaign on blockchain:', blockchainError);
        
        // Continue even if blockchain creation fails
        return NextResponse.json({
          success: true,
          message: 'Candidates added but blockchain creation failed',
          candidates: campaign.candidates,
          blockchainError: blockchainError.message
        });
      }
    }

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
