import { NextResponse } from 'next/server';
import { connect } from 'near-api-js';
import { getServerKeyStore, serverNearConfig } from '@/lib/near-server-config';

export async function GET() {
  try {
    console.log('Testing NEAR account connection');
    
    // Check if private key is configured
    if (!process.env.NEAR_PRIVATE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'NEAR_PRIVATE_KEY environment variable is not set'
      }, { status: 500 });
    }
    
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
    
    // Get account state
    const state = await account.state();
    
    console.log('Account state:', state);
    
    return NextResponse.json({
      success: true,
      accountId: account.accountId,
      balance: state.amount,
      hasKey: true,
      networkId: serverNearConfig.networkId,
      contractName: serverNearConfig.contractName
    });
  } catch (error) {
    console.error('Error testing NEAR account:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
} 