import { NextResponse } from 'next/server';
import { connect, keyStores, Contract } from 'near-api-js';
import { nearConfig } from '@/lib/near-config';

export async function GET() {
  try {
    console.log('Testing blockchain contract methods');
    
    // Connect to NEAR
    const keyStore = new keyStores.InMemoryKeyStore();
    const near = await connect({
      keyStore,
      ...nearConfig,
      headers: {}
    });
    
    // Get the account
    const account = await near.account('yasn.testnet');
    
    // Get contract methods
    const contract = new Contract(account, 'yasn.testnet', {
      viewMethods: ['get_campaign', 'get_campaigns', 'get_votes'],
      changeMethods: ['create_campaign', 'cast_vote']
    });
    
    // Check available methods
    const methods = {
      viewMethods: Object.keys(contract).filter(key => 
        typeof contract[key] === 'function' && 
        ['get_campaign', 'get_campaigns', 'get_votes'].includes(key)
      ),
      changeMethods: Object.keys(contract).filter(key => 
        typeof contract[key] === 'function' && 
        ['create_campaign', 'cast_vote'].includes(key)
      )
    };
    
    console.log('Available contract methods:', methods);
    
    // Try to get all campaigns
    try {
      const campaigns = await account.viewFunction({
        contractId: 'yasn.testnet',
        methodName: 'get_campaigns',
        args: {}
      });
      
      console.log('Existing campaigns on blockchain:', campaigns);
      
      return NextResponse.json({
        success: true,
        methods,
        campaigns
      });
    } catch (viewError) {
      console.error('Error viewing campaigns:', viewError);
      
      return NextResponse.json({
        success: false,
        methods,
        error: viewError.message
      });
    }
  } catch (error) {
    console.error('Error testing blockchain contract:', error);
    return NextResponse.json(
      { error: 'Failed to test blockchain contract' },
      { status: 500 }
    );
  }
} 