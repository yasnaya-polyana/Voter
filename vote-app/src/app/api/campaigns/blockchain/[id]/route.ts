import { NextResponse } from 'next/server';
import { connect, keyStores } from 'near-api-js';
import { nearConfig } from '@/lib/near-config';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    
    console.log('Fetching blockchain campaign details for:', campaignId);
    
    // Connect to NEAR
    const keyStore = new keyStores.InMemoryKeyStore();
    const near = await connect({
      keyStore,
      ...nearConfig,
      headers: {}
    });
    
    // Get the account
    const account = await near.account('yasn.testnet');
    
    // Call the contract method
    console.log('Calling contract get_campaign method...');
    const result = await account.viewFunction({
      contractId: 'yasn.testnet',
      methodName: 'get_campaign',
      args: { campaign_id: campaignId }
    });
    
    console.log('Campaign details from blockchain:', result);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Campaign not found on blockchain' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching blockchain campaign details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign details from blockchain' },
      { status: 500 }
    );
  }
} 