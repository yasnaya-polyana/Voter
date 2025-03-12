'use client';

import { useNear } from '@/context/NearContext';
import { getCampaign } from '@/lib/near-contract';
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

export default function CampaignViewPage({ params }: { params: { id: string } }) {
  const { wallet, isSignedIn } = useNear();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    async function loadCampaign() {
      try {
        if (wallet) {
          const contract = getCampaign(wallet.account());
          const result = await contract.get_campaign({ campaign_id: params.id });
          setCampaign(result);

          // If campaign has ended, fetch results
          if (result.endDate < Date.now()) {
            const campaignResults = await contract.get_campaign_results({ 
              campaign_id: params.id 
            });
            setResults(campaignResults);
          }
        }
      } catch (error) {
        console.error('Error loading campaign:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCampaign();
  }, [wallet, params.id]);

  if (loading) {
    return (
      <div className="text-center p-4">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center p-4">
        <h1>Campaign not found</h1>
      </div>
    );
  }

  const isAuthorized = campaign.isPublic || isSignedIn;
  const isEnded = campaign.endDate < Date.now();

  if (!isAuthorized) {
    return (
      <div className="text-center p-4">
        <h1>Not authorized to view this campaign</h1>
      </div>
    );
  }

  // Find winner if campaign has ended
  let winner = '';
  if (isEnded && results.size > 0) {
    winner = Array.from(results.entries()).reduce((a, b) => 
      (results.get(a[0]) || 0) > (results.get(b[0]) || 0) ? a : b
    )[0];
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{campaign.title}</h1>
      <div className="bg-white shadow rounded p-4">
        <p>Start Date: {new Date(campaign.startDate).toLocaleDateString()}</p>
        <p>End Date: {new Date(campaign.endDate).toLocaleDateString()}</p>
        <p>Status: {isEnded ? 'Ended' : 'Active'}</p>
        
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Candidates</h2>
          <ul className="space-y-2">
            {campaign.candidates.map((candidate: string) => (
              <li key={candidate} className="flex justify-between items-center">
                <span>{candidate}</span>
                {isEnded && (
                  <span className="badge badge-primary">
                    {results.get(candidate) || 0} votes
                    {candidate === winner && ' 🏆'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {isEnded && winner && (
          <div className="mt-6 p-4 bg-success text-white rounded">
            <h3 className="text-lg font-bold">Winner: {winner}</h3>
            <p>Total Votes: {results.get(winner)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
