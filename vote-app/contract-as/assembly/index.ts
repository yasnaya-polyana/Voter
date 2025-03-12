import { context, storage, PersistentMap, logging } from "near-sdk-as";

@nearBindgen
class Campaign {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public candidates: string[],
    public startDate: u64,
    public endDate: u64,
    public isPublic: boolean
  ) {}
}

@nearBindgen
class Vote {
  constructor(
    public campaign_id: string,
    public candidate_id: string,
    public voter: string,
    public timestamp: u64
  ) {}
}

// Storage collections
const campaigns = new PersistentMap<string, Campaign>("c");
const votes = new PersistentMap<string, Vote[]>("v");
const voterHistory = new PersistentMap<string, string[]>("vh");

// Create a new campaign
export function create_campaign(
  campaign_id: string,
  title: string,
  description: string,
  candidates: string[],
  start_date: string,
  end_date: string,
  is_public: boolean
): boolean {
  // Check if campaign already exists
  if (campaigns.contains(campaign_id)) {
    logging.log("Campaign already exists");
    return false;
  }

  // Convert string dates to u64 using a different approach
  const startDateU64 = u64(parseInt(start_date, 10));
  const endDateU64 = u64(parseInt(end_date, 10));

  // Create new campaign
  const campaign = new Campaign(
    campaign_id,
    title,
    description,
    candidates,
    startDateU64,
    endDateU64,
    is_public
  );

  // Save campaign
  campaigns.set(campaign_id, campaign);
  logging.log("Campaign created: " + campaign_id);
  return true;
}

// Cast a vote
export function cast_vote(
  campaign_id: string,
  candidate_id: string,
  public_key: string
): boolean {
  // Check if campaign exists
  if (!campaigns.contains(campaign_id)) {
    logging.log("Campaign not found");
    return false;
  }

  // Get campaign
  const campaign = campaigns.get(campaign_id)!;

  // Check if candidate exists
  let candidateExists = false;
  for (let i = 0; i < campaign.candidates.length; i++) {
    if (campaign.candidates[i] == candidate_id) {
      candidateExists = true;
      break;
    }
  }

  if (!candidateExists) {
    logging.log("Candidate not found");
    return false;
  }

  // Create vote
  const vote = new Vote(
    campaign_id,
    candidate_id,
    context.sender,
    context.blockTimestamp
  );

  // Get existing votes for this campaign
  let campaignVotes: Vote[] = [];
  if (votes.contains(campaign_id)) {
    campaignVotes = votes.get(campaign_id)!;
  }

  // Add vote
  campaignVotes.push(vote);
  votes.set(campaign_id, campaignVotes);

  // Update voter history
  let history: string[] = [];
  if (voterHistory.contains(context.sender)) {
    history = voterHistory.get(context.sender)!;
  }
  history.push(campaign_id);
  voterHistory.set(context.sender, history);

  logging.log("Vote cast for campaign: " + campaign_id);
  return true;
}

// Get campaign details
export function get_campaign(campaign_id: string): Campaign | null {
  if (!campaigns.contains(campaign_id)) {
    return null;
  }
  return campaigns.get(campaign_id);
}

// Get all campaigns
export function get_campaigns(): string[] {
  // This is a simplified implementation
  // In a real contract, you would need pagination
  const result: string[] = [];
  // We can't iterate over PersistentMap directly
  // This is just a placeholder
  return result;
}

// Get campaign results
export function get_campaign_results(campaign_id: string): Map<string, i32> {
  const results = new Map<string, i32>();
  
  if (!campaigns.contains(campaign_id)) {
    logging.log("Campaign not found");
    return results;
  }
  
  if (!votes.contains(campaign_id)) {
    return results; // No votes yet
  }
  
  const campaignVotes = votes.get(campaign_id)!;
  
  for (let i = 0; i < campaignVotes.length; i++) {
    const vote = campaignVotes[i];
    const count = results.has(vote.candidate_id) ? results.get(vote.candidate_id) + 1 : 1;
    results.set(vote.candidate_id, count);
  }
  
  return results;
}

// Get voter history
export function get_voter_history(voter_id: string): string[] {
  if (!voterHistory.contains(voter_id)) {
    return [];
  }
  return voterHistory.get(voter_id)!;
} 