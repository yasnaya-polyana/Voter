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
    const { campaignId, name, description, candidates, startDate, endDate, isPublic } = await request.json();
    
    if (!campaignId || !name || !candidates) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Use a default description if none is provided
    const campaignDescription = description || `Campaign created with ID: ${campaignId}`;
    
    // Convert candidates from objects to strings (just use the names)
    const candidateNames = candidates.map(c => String(c.name));
    
    // Default dates if not provided
    const start = startDate || Date.now().toString();
    const end = endDate || (Date.now() + 86400000).toString(); // Default to 24 hours later
    
    // Default to public if not specified
    const publicCampaign = isPublic !== undefined ? isPublic : true;
    
    console.log('Creating campaign on blockchain with correct format:', {
      campaign_id: campaignId,
      title: name,
      description: campaignDescription,
      candidates: candidateNames,
      start_date: start,
      end_date: end,
      is_public: publicCampaign
    });
    
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
      
      // Log account details to verify it's working
      console.log('Account ID:', account.accountId);
      
      // Call the create_campaign method with the correct parameters
      const result = await account.functionCall({
        contractId: serverNearConfig.contractName,
        methodName: 'create_campaign',
        args: {
          campaign_id: String(campaignId),
          title: String(name),
          description: String(campaignDescription),
          candidates: candidateNames,
          start_date: String(start),
          end_date: String(end),
          is_public: publicCampaign
        },
        gas: serverNearConfig.GAS,
        attachedDeposit: serverNearConfig.attachedDeposit
      });
      
      console.log('Campaign created on blockchain:', result);
      
      return NextResponse.json({
        success: true,
        transactionHash: result.transaction_outcome.id,
        result
      });
    } catch (callError) {
      console.error('Error calling create_campaign:', callError);
      
      // Provide more detailed error information
      let errorMessage = callError.message;
      if (callError.kind && callError.kind.ExecutionError) {
        errorMessage = callError.kind.ExecutionError;
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: callError
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating campaign on blockchain:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign on blockchain' },
      { status: 500 }
    );
  }
} 