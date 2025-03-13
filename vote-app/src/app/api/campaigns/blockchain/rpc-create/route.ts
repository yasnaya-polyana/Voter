import { NextResponse } from 'next/server';
import { connect, providers, utils } from 'near-api-js';
import { getServerKeyStore, serverNearConfig } from '@/lib/near-server-config';

export async function POST(request: Request) {
  try {
    const { campaignId, name, description } = await request.json();
    
    if (!campaignId || !name) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Use a default description if none is provided
    const campaignDescription = description || `Campaign created with ID: ${campaignId}`;
    
    // Create a very simple campaign with minimal data
    const now = Date.now().toString();
    const tomorrow = (Date.now() + 86400000).toString();
    
    // Create args matching the contract's expected format
    const args = {
      campaign_id: String(campaignId),
      title: String(name),
      description: String(campaignDescription),
      candidates: ["Option A", "Option B"],  // Array of strings, not objects!
      start_date: now,
      end_date: tomorrow,
      is_public: true
    };
    
    console.log('Creating campaign with RPC call:', JSON.stringify(args, null, 2));
    
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
      
      // Get the account ID
      const accountId = account.accountId;
      console.log('Account ID:', accountId);
      
      // Sign and send the transaction
      const transaction = await account.signAndSendTransaction({
        receiverId: serverNearConfig.contractName,
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: 'create_campaign',
              args: args,
              gas: '300000000000000',
              deposit: '0'
            }
          }
        ]
      });
      
      console.log('Transaction result:', transaction);
      
      return NextResponse.json({
        success: true,
        transaction
      });
    } catch (callError) {
      console.error('Error with RPC call:', callError);
      
      return NextResponse.json({
        success: false,
        error: callError.message,
        details: callError
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating campaign with RPC:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign with RPC' },
      { status: 500 }
    );
  }
} 