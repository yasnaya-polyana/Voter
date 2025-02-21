import { Contract } from 'near-api-js';

export interface VoteContract extends Contract {
  cast_vote: (args: {
    campaign_id: string;
    candidate_id: string;
    private_key?: string;
  }) => Promise<void>;
  get_campaign_results: (args: { campaign_id: string }) => Promise<Map<string, number>>;
  get_campaign: (args: { campaign_id: string }) => Promise<{
    id: string;
    title: string;
    candidates: string[];
    startDate: number;
    endDate: number;
    isPublic: boolean;
    status: 'active' | 'ended';
  }>;
}

export function getContract(account: any): VoteContract {
  return new Contract(account, process.env.NEXT_PUBLIC_NEAR_CONTRACT_NAME!, {
    viewMethods: ['get_campaign', 'get_campaign_results'],
    changeMethods: ['cast_vote'],
  }) as VoteContract;
} 