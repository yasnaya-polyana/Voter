import { NextResponse } from 'next/server';
import { connect } from 'near-api-js';
import { getServerKeyStore, serverNearConfig } from '@/lib/near-server-config';

export async function GET() {
  try {
    console.log('Debugging contract interface');
    
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
    
    // Try to get the contract schema or metadata if available
    try {
      const contractMetadata = await account.viewFunction({
        contractId: serverNearConfig.contractName,
        methodName: '__contract_metadata',
        args: {}
      });
      
      return NextResponse.json({
        success: true,
        metadata: contractMetadata
      });
    } catch (metadataError) {
      console.log('Contract metadata not available, trying to get ABI');
      
      // Try to get the contract ABI if available
      try {
        const contractAbi = await account.viewFunction({
          contractId: serverNearConfig.contractName,
          methodName: '__abi',
          args: {}
        });
        
        return NextResponse.json({
          success: true,
          abi: contractAbi
        });
      } catch (abiError) {
        console.log('Contract ABI not available, trying to get a sample campaign');
        
        // Try to get existing campaigns to see their structure
        try {
          const campaigns = await account.viewFunction({
            contractId: serverNearConfig.contractName,
            methodName: 'get_campaigns',
            args: {}
          });
          
          return NextResponse.json({
            success: true,
            sampleData: campaigns
          });
        } catch (campaignsError) {
          return NextResponse.json({
            success: false,
            error: 'Could not retrieve contract information',
            metadataError: metadataError.message,
            abiError: abiError.message,
            campaignsError: campaignsError.message
          });
        }
      }
    }
  } catch (error) {
    console.error('Error debugging contract:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
} 