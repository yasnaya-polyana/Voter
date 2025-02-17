use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::{env, near_bindgen, AccountId, PanicOnDefault};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct VotingContract {
    pub owner_id: AccountId,
    pub campaigns: UnorderedMap<String, Campaign>,
    pub votes: UnorderedMap<String, Vote>,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Campaign {
    pub id: String,
    pub name: String,
    pub candidates: Vec<Candidate>,
    pub start_date: u64,
    pub end_date: u64,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Candidate {
    pub id: String,
    pub name: String,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Vote {
    pub campaign_id: String,
    pub candidate_id: String,
    pub voter: AccountId,
    pub timestamp: u64,
}

#[near_bindgen]
impl VotingContract {
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        Self {
            owner_id,
            campaigns: UnorderedMap::new(b"c"),
            votes: UnorderedMap::new(b"v"),
        }
    }

    pub fn create_campaign(&mut self, id: String, name: String, candidates: Vec<Candidate>, start_date: u64, end_date: u64) {
        assert_eq!(env::predecessor_account_id(), self.owner_id, "Only owner can create campaigns");
        let campaign = Campaign {
            id: id.clone(),
            name,
            candidates,
            start_date,
            end_date,
        };
        self.campaigns.insert(&id, &campaign);
    }

    pub fn cast_vote(&mut self, campaign_id: String, candidate_id: String) {
        let campaign = self.campaigns.get(&campaign_id).expect("Campaign not found");
        assert!(env::block_timestamp() >= campaign.start_date, "Voting has not started");
        assert!(env::block_timestamp() <= campaign.end_date, "Voting has ended");
        
        let voter = env::predecessor_account_id();
        let vote = Vote {
            campaign_id: campaign_id.clone(),
            candidate_id,
            voter: voter.clone(),
            timestamp: env::block_timestamp(),
        };
        
        let vote_key = format!("{}:{}", campaign_id, voter);
        assert!(self.votes.get(&vote_key).is_none(), "Already voted");
        self.votes.insert(&vote_key, &vote);
    }
} 