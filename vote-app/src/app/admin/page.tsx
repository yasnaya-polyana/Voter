'use client';

import { useEffect, useState } from 'react';
import { useNear } from '@/context/NearContext';
import Link from 'next/link';

interface Campaign {
  id: string;
  title: string;
  startDate: number;
  endDate: number;
  isPublic: boolean;
  candidates: string[];
}

export default function AdminPage() {
  const { wallet, isSignedIn, signIn } = useNear();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCampaigns() {
      if (wallet && isSignedIn) {
        try {
          const response = await fetch('/api/admin/campaigns');
          const data = await response.json();
          setCampaigns(data);
        } catch (error) {
          console.error('Error loading campaigns:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    loadCampaigns();
  }, [wallet, isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <button onClick={signIn} className="btn btn-primary">
          Sign in with NEAR Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/create" className="btn btn-primary">
          Create New Campaign
        </Link>
      </div>

      {loading ? (
        <div className="text-center">Loading campaigns...</div>
      ) : campaigns.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{campaign.title}</h2>
                <p>Start: {new Date(campaign.startDate).toLocaleDateString()}</p>
                <p>End: {new Date(campaign.endDate).toLocaleDateString()}</p>
                <p>Type: {campaign.isPublic ? 'Public' : 'Private'}</p>
                <div className="card-actions justify-end">
                  <Link href={`/admin/campaign/${campaign.id}`} className="btn btn-primary">
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">No campaigns found</div>
      )}
    </div>
  );
}
