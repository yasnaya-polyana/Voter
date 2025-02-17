import { Contract } from 'near-api-js';
import { nearConfig } from './near-config';

export interface Campaign {
  id: string;
  candidates: string[];
  startDate: number;
  endDate: number;
  isPublic: boolean;
}

export interface Vote {
  campaignId: string;
  candidateId: string;
  voter: string;
}

export interface VoteContract extends Contract {
  create_campaign: (args: {
    campaign_id: string,
    candidates: string[],
    start_date: number,
    end_date: number,
    is_public: boolean
  }) => Promise<void>;
  
  cast_vote: (args: {
    campaign_id: string,
    candidate_id: string,
    public_key: string
  }) => Promise<void>;
  
  get_campaign_results: (args: {
    campaign_id: string
  }) => Promise<Map<string, number>>;
}

export const getContract = (account: any): VoteContract => {
  return new Contract(account, nearConfig.contractName, {
    viewMethods: ['get_campaign_results'],
    changeMethods: ['create_campaign', 'cast_vote'],
    sender: account.accountId
  }) as VoteContract;
}; 