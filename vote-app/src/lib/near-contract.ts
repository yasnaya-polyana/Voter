import { Contract } from 'near-api-js';
import { utils } from 'near-api-js';
import { CreateCampaignParams, CastVoteParams, Campaign } from './near-contract-types';

interface VoteHistory {
  campaignId: string;
  candidateId: string;
  timestamp: number;
  campaignTitle?: string;
}

export interface VoteContract extends Contract {
  cast_vote: (
    args: {
      campaign_id: string;
      candidate_id: string;
      public_key: string;
    },
    gas?: number,
    deposit?: string | number
  ) => Promise<void>;
  
  get_campaign_results: (args: { campaign_id: string }) => Promise<any>;
  
  get_campaign: (args: { 
    campaign_id: string 
  }) => Promise<{
    id: string;
    title: string;
    candidates: string[];
    startDate: number;
    endDate: number;
    isPublic: boolean;
    status: 'active' | 'ended';
  }>;

  get_voter_history: (args: { voter_id: string }) => Promise<any[]>;
  
  create_campaign: (
    args: CreateCampaignParams,
    gas?: string,
    deposit?: string
  ) => Promise<any>;
  
  get_campaigns: () => Promise<Campaign[]>;
  
  get_votes: (args: { campaign_id: string }) => Promise<number>;
}

export function getContract(account: any): VoteContract {
  const contractName = process.env.NEXT_PUBLIC_NEAR_CONTRACT_NAME || 'yasn.testnet';
  console.log('Creating contract instance for:', contractName);
  
  return new Contract(
    account,
    contractName, 
    {
      viewMethods: ['get_campaign', 'get_campaign_results', 'get_voter_history', 'get_campaigns', 'get_votes'],
      changeMethods: ['cast_vote', 'create_campaign'],
      sender: account.accountId
    }
  ) as VoteContract;
}

export async function verifyContractMethods(account: any) {
  try {
    const contract = getContract(account);
    
    console.log('=== Contract Method Verification ===');
    
    // List all available methods
    console.log('Available view methods:', contract.viewMethods);
    console.log('Available change methods:', contract.changeMethods);
    
    // Test view method
    const testHistory = await contract.get_voter_history({
      voter_id: account.accountId
    });
    console.log('History method test:', testHistory);
    
    return {
      status: 'active',
      methods: {
        view: contract.viewMethods,
        change: contract.changeMethods
      }
    };
  } catch (error) {
    console.error('Contract verification failed:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
}

export async function checkCampaignAndVote(account: any) {
  const contract = getContract(account);
  
  try {
    console.log('=== Campaign and Vote Verification ===');
    
    // Get the campaign you created
    const campaign = await contract.get_campaign({
      campaign_id: '1' // Replace with your campaign ID
    });
    console.log('Campaign details:', campaign);
    
    // Get your vote
    const voterHistory = await contract.get_voter_history({
      voter_id: account.accountId
    });
    console.log('Your voting history:', voterHistory);
    
    // Get campaign results
    const results = await contract.get_campaign_results({
      campaign_id: '1' // Replace with your campaign ID
    });
    console.log('Campaign results:', results);
    
    return {
      campaign,
      voterHistory,
      results
    };
  } catch (error) {
    console.error('Campaign and vote check failed:', error);
    return {
      error: error.message
    };
  }
}

export async function checkContractMethods(account: any) {
  try {
    console.log('🔍 Checking available contract methods...');
    
    // This is a special NEAR RPC call to get contract methods
    const result = await account.connection.provider.query({
      request_type: 'call_function',
      account_id: 'yasn.testnet',
      method_name: '__methods',
      args_base64: '',
      finality: 'optimistic'
    });
    
    if (result && result.result) {
      const methods = Buffer.from(result.result).toString();
      console.log('📋 Available contract methods:', methods);
      return methods;
    }
    
    console.log('❌ Could not retrieve contract methods');
    return null;
  } catch (error) {
    console.error('❌ Error checking contract methods:', error);
    return null;
  }
} 