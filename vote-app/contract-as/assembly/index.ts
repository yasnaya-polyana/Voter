import { context, storage, PersistentMap, logging } from "near-sdk-as";

@nearBindgen
class Campaign {
  constructor(
    public id: string,
    public candidates: string[],
    public startDate: u64,
    public endDate: u64,
    public isPublic: boolean
  ) {}
}

@nearBindgen
class Vote {
  constructor(
    public campaignId: string,
    public candidateId: string,
    public voter: string
  ) {}
}

const campaigns = new PersistentMap<string, Campaign>("c");
const votes = new PersistentMap<string, Array<Vote>>("v");
const voters = new PersistentMap<string, Array<string>>("r");

export function create_campaign(
  campaign_id: string,
  candidates: string[],
  start_date: u64,
  end_date: u64,
  is_public: boolean
): void {
  assert(!campaigns.contains(campaign_id), "Campaign ID already exists");
  
  const campaign = new Campaign(
    campaign_id,
    candidates,
    start_date,
    end_date,
    is_public
  );
  
  campaigns.set(campaign_id, campaign);
  votes.set(campaign_id, new Array<Vote>());
  voters.set(campaign_id, new Array<string>());
}

export function cast_vote(
  campaign_id: string,
  candidate_id: string,
  public_key: string
): void {
  assert(campaigns.contains(campaign_id), "Campaign not found");
  
  const campaign = campaigns.getSome(campaign_id);
  const current_time: u64 = context.blockTimestamp;
  assert(campaign.startDate <= current_time, "Voting has not started");
  assert(campaign.endDate >= current_time, "Voting has ended");
  
  const voter = context.sender;
  const voterList = voters.contains(campaign_id) 
    ? voters.getSome(campaign_id) 
    : new Array<string>();
    
  assert(!voterList.includes(voter), "Already voted in this campaign");
  
  const vote = new Vote(campaign_id, candidate_id, voter);
  const campaignVotes = votes.contains(campaign_id)
    ? votes.getSome(campaign_id)
    : new Array<Vote>();
  
  campaignVotes.push(vote);
  votes.set(campaign_id, campaignVotes);
  
  voterList.push(voter);
  voters.set(campaign_id, voterList);
}

export function get_campaign_results(campaign_id: string): Map<string, i32> {
  assert(campaigns.contains(campaign_id), "Campaign not found");
  
  const results = new Map<string, i32>();
  if (!votes.contains(campaign_id)) {
    return results;
  }
  
  const campaignVotes = votes.getSome(campaign_id);
  for (let i = 0; i < campaignVotes.length; i++) {
    const candidateId = campaignVotes[i].candidateId;
    const currentVotes = results.has(candidateId) ? results.get(candidateId) : 0;
    results.set(candidateId, currentVotes + 1);
  }
  
  return results;
} 