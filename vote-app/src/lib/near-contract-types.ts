// Define the expected parameters for the create_campaign method
export interface CreateCampaignParams {
  campaign_id: string;
  title: string; // Note: The contract expects 'title', not 'name'
  description: string;
  candidates: {
    id: string;
    name: string;
  }[];
}

// Define the expected parameters for the cast_vote method
export interface CastVoteParams {
  campaign_id: string;
  candidate_id: string;
  voter_id: string;
}

// Define the expected response from the get_campaign method
export interface Campaign {
  id: string;
  title: string;
  description: string;
  candidates: {
    id: string;
    name: string;
    votes: number;
  }[];
  total_votes: number;
} 