import { NextResponse } from 'next/server';
import { connect } from 'near-api-js';
import { getServerKeyStore, serverNearConfig } from '@/lib/near-server-config';

export async function POST(request: Request) {
  try {
    const { campaignId } = await request.json();
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Missing campaign ID' },
        { status: 400 }
      );
    }
    
    console.log('Checking if campaign exists on blockchain:', campaignId);
    
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
      
      // Call the get_campaign method to check if the campaign exists
      const result = await account.viewFunction({
        contractId: serverNearConfig.contractName,
        methodName: 'get_campaign',
        args: {
          campaign_id: campaignId
        }
      });
      
      console.log('Campaign exists on blockchain:', !!result);
      
      return NextResponse.json({
        exists: !!result,
        campaign: result
      });
    } catch (callError) {
      console.error('Error checking campaign on blockchain:', callError);
      
      // If the error is because the campaign doesn't exist, return false
      if (callError.message && callError.message.includes('does not exist')) {
        return NextResponse.json({
          exists: false,
          error: 'Campaign does not exist on blockchain'
        });
      }
      
      // For other errors, return the error
      return NextResponse.json({
        exists: false,
        error: callError.message || 'Unknown error checking campaign'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in blockchain check API:', error);
    return NextResponse.json(
      { error: 'Failed to check campaign on blockchain' },
      { status: 500 }
    );
  }
} 