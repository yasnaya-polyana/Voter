import { NextResponse } from 'next/server';
import { connect } from 'near-api-js';
import { getServerKeyStore, serverNearConfig } from '@/lib/near-server-config';

// Helper function to sanitize objects for blockchain
function sanitizeForBlockchain(obj) {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForBlockchain(item));
  }
  
  // Handle objects
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip empty keys
    if (key === '') {
      console.warn('Found empty key in object, skipping:', obj);
      continue;
    }
    
    // Recursively sanitize nested objects
    result[key] = sanitizeForBlockchain(value);
  }
  
  return result;
}

export async function POST(request: Request) {
  try {
    const { campaignId, name } = await request.json();
    
    if (!campaignId || !name) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Create a very simple campaign with minimal data
    const now = Date.now().toString();
    const tomorrow = (Date.now() + 86400000).toString();
    
    // Create args matching the contract's expected format
    const args = {
      campaign_id: String(campaignId),
      title: String(name),
      description: String(`Simple test campaign for ${name}`),
      candidates: ["Option A", "Option B"],  // Array of strings, not objects!
      start_date: now,
      end_date: tomorrow,
      is_public: true
    };
    
    console.log('Creating simple campaign on blockchain:', JSON.stringify(args, null, 2));
    
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
      
      // Call the create_campaign method with simplified data
      const result = await account.functionCall({
        contractId: serverNearConfig.contractName,
        methodName: 'create_campaign',
        args: args,
        gas: serverNearConfig.GAS,
        attachedDeposit: serverNearConfig.attachedDeposit
      });
      
      console.log('Simple campaign created on blockchain:', result);
      
      return NextResponse.json({
        success: true,
        transactionHash: result.transaction_outcome.id,
        result
      });
    } catch (callError) {
      console.error('Error calling create_campaign with simple data:', callError);
      
      return NextResponse.json({
        success: false,
        error: callError.message,
        details: callError
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating simple campaign on blockchain:', error);
    return NextResponse.json(
      { error: 'Failed to create simple campaign on blockchain' },
      { status: 500 }
    );
  }
} 