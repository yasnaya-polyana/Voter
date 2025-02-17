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
}

export default function CampaignViewPage({ params }: { params: { id: string } }) {
  const { wallet, isSignedIn } = useNear();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCampaign() {
      try {
        if (wallet) {
          const contract = getCampaign(wallet.account());
          const result = await contract.get_campaign({ campaign_id: params.id });
          setCampaign(result);
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

  if (!isAuthorized) {
    return (
      <div className="text-center p-4">
        <h1>Not authorized to view this campaign</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{campaign.title}</h1>
      <div className="bg-white shadow rounded p-4">
        <p>Start Date: {new Date(campaign.startDate).toLocaleDateString()}</p>
        <p>End Date: {new Date(campaign.endDate).toLocaleDateString()}</p>
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Candidates</h2>
          <ul className="list-disc pl-5">
            {campaign.candidates.map((candidate: string) => (
              <li key={candidate}>{candidate}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
