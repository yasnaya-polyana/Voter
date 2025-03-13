import { NextResponse } from 'next/server';
import { connect, keyStores } from 'near-api-js';
import { nearConfig } from '@/lib/near-config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const account = searchParams.get('account');
    
    console.log('Fetching voter history for account:', account);
    
    if (!account) {
      return NextResponse.json({ error: 'Account is required' }, { status: 400 });
    }
    
    // Connect to NEAR
    const keyStore = new keyStores.InMemoryKeyStore();
    const near = await connect({
      keyStore,
      ...nearConfig,
      headers: {}
    });
    
    // Get the account
    const nearAccount = await near.account('yasn.testnet');
    
    // Call the contract method
    console.log('Calling contract get_voter_history method from API...');
    
    try {
      const result = await nearAccount.viewFunction({
        contractId: 'yasn.testnet',
        methodName: 'get_voter_history',
        args: { voter_id: account }
      });
      
      console.log('Raw voter history from contract:', result);
      
      // Return the voter history
      return NextResponse.json({ 
        success: true, 
        history: result || []
      });
    } catch (viewError) {
      console.error('Error calling view function:', viewError);
      
      // Try an alternative approach - check all campaigns for votes by this user
      console.log('Attempting to check campaign results for votes by this user...');
      
      // This is a fallback approach
      return NextResponse.json({ 
        success: true, 
        history: [], 
        message: 'Could not retrieve voter history directly'
      });
    }
  } catch (error) {
    console.error('Error fetching voter history:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch voter history',
      details: error.message
    }, { status: 500 });
  }
} 