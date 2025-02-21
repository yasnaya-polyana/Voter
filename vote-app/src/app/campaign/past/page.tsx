'use client';

import React from 'react';
import { useNear } from '@/context/NearContext';
import { getContract } from '@/lib/near-contract';
import { useEffect, useState } from 'react';

interface Campaign {
  id: string;
  title: string;
  candidates: string[];
  startDate: number;
  endDate: number;
  isPublic: boolean;
  status: 'active' | 'ended';
  results?: Map<string, number>;
}

const PastCampaignsPage: React.FC = () => {
  const { wallet, isSignedIn, signIn } = useNear();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPastCampaigns() {
      if (wallet && isSignedIn) {
        try {
          const contract = getContract(wallet.account());
          const allCampaigns = await contract.get_user_campaigns({
            account_id: wallet.getAccountId()
          });
          
          // Filter for ended campaigns and fetch their results
          const pastCampaigns = [];
          for (const campaign of allCampaigns) {
            if (campaign.endDate < Date.now()) {
              const results = await contract.get_campaign_results({
                campaign_id: campaign.id
              });
              pastCampaigns.push({
                ...campaign,
                results,
                status: 'ended'
              });
            }
          }
          setCampaigns(pastCampaigns);
        } catch (error) {
          console.error('Error loading past campaigns:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    loadPastCampaigns();
  }, [wallet, isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Past Campaigns</h1>
        <button onClick={signIn} className="btn btn-primary">
          Sign in with NEAR Wallet
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Past Campaigns</h1>
        <p>You don't have any completed campaigns yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Past Campaigns</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => {
          // Find the winner
          let winner = '';
          let maxVotes = 0;
          if (campaign.results) {
            campaign.results.forEach((votes, candidate) => {
              if (votes > maxVotes) {
                maxVotes = votes;
                winner = candidate;
              }
            });
          }

          return (
            <div key={campaign.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{campaign.title}</h2>
                <p className="text-sm text-gray-500">
                  Ended: {new Date(campaign.endDate).toLocaleDateString()}
                </p>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Results:</h3>
                  <ul className="space-y-2">
                    {campaign.candidates.map((candidate) => (
                      <li key={candidate} className="flex justify-between items-center">
                        <span>{candidate}</span>
                        <span className="badge badge-primary">
                          {campaign.results?.get(candidate) || 0} votes
                          {candidate === winner && ' 🏆'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {winner && (
                  <div className="mt-4 p-3 bg-success text-success-content rounded-lg">
                    <p className="font-bold">Winner: {winner}</p>
                    <p className="text-sm">Total Votes: {maxVotes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PastCampaignsPage;
