import { NextResponse } from 'next/server';
import { connect, keyStores } from 'near-api-js';
import { nearConfig } from '@/lib/near-config';

export async function POST(request: Request) {
  try {
    const { campaignId } = await request.json();
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Checking if campaign exists on blockchain:', campaignId);
    
    // Connect to NEAR
    const keyStore = new keyStores.InMemoryKeyStore();
    const near = await connect({
      keyStore,
      ...nearConfig,
      headers: {}
    });
    
    // Get the account
    const account = await near.account('yasn.testnet');
    
    try {
      // Call the contract method to get the campaign
      const result = await account.viewFunction({
        contractId: 'yasn.testnet',
        methodName: 'get_campaign',
        args: { campaign_id: campaignId }
      });
      
      console.log('Campaign exists on blockchain:', !!result);
      
      return NextResponse.json({
        exists: true,
        details: result
      });
    } catch (error) {
      console.log('Campaign does not exist on blockchain or error occurred:', error);
      return NextResponse.json({
        exists: false,
        error: 'Campaign not found on blockchain'
      });
    }
  } catch (error) {
    console.error('Error checking campaign on blockchain:', error);
    return NextResponse.json(
      { error: 'Failed to check campaign on blockchain' },
      { status: 500 }
    );
  }
} 