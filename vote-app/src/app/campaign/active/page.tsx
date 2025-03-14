'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CountdownTimer from '@/components/CountdownTimer';

interface Campaign {
  _id: string;
  id?: string;
  campaignName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'ended';
  isPublic: boolean;
  totalVotes?: number;
  publicKey: string;
  candidateCount?: number;
  blockchainId?: string;
  blockchainTxHash?: string;
  createdBy: string;
}

const ActiveCampaignsPage = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns/all');
        if (!response.ok) throw new Error('Failed to fetch campaigns');
        const data = await response.json();
        
        // Normalize the data structure
        const normalizedCampaigns = data.map((campaign: any) => ({
          _id: campaign.id || campaign._id,
          campaignName: campaign.campaignName,
          description: campaign.description || '',
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          status: campaign.status,
          isPublic: campaign.isPublic,
          totalVotes: campaign.totalVotes || 0,
          publicKey: campaign.publicKey,
          candidateCount: campaign.candidateCount || campaign.candidates?.length || 0,
          blockchainId: campaign.blockchainId,
          blockchainTxHash: campaign.blockchainTxHash,
          createdBy: campaign.createdBy
        }));
        
        setCampaigns(normalizedCampaigns);
      } catch (err) {
        setError('Failed to load campaigns');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active');
  const upcomingCampaigns = campaigns.filter(campaign => campaign.status === 'upcoming');
  const endedCampaigns = campaigns.filter(campaign => campaign.status === 'ended');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const CampaignCard = ({ campaign }: { campaign: Campaign }) => (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
      <div className="card-body">
        <h2 className="card-title">{campaign.campaignName}</h2>
        
        <div className="text-sm space-y-1 mt-2 font-mono bg-base-200 p-3 rounded-lg">
          <div className="flex justify-between">
            <span className="text-gray-500">Campaign ID:</span>
            <span className="font-semibold">{campaign._id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Public Key:</span>
            <span className="font-semibold">{campaign.publicKey}</span>
          </div>
        </div>

        <p className="text-gray-600 line-clamp-2 mt-2">{campaign.description}</p>
        
        <div className="flex gap-2 my-2">
          <div className="badge badge-primary">
            {campaign.isPublic ? 'Public' : 'Private'}
          </div>
          <div className={`badge ${
            campaign.status === 'active' ? 'badge-success' : 
            campaign.status === 'upcoming' ? 'badge-warning' : 
            'badge-error'
          }`}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </div>
          {campaign.candidateCount > 0 && (
            <div className="badge badge-outline">
              {campaign.candidateCount} candidates
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p>Start: {new Date(campaign.startDate).toLocaleDateString()}</p>
          <p>End: {new Date(campaign.endDate).toLocaleDateString()}</p>
          {campaign.totalVotes !== undefined && (
            <p>Votes: {campaign.totalVotes}</p>
          )}
        </div>

        <div className="card-actions justify-end mt-4">
          <Link 
            href={`/campaign/${campaign._id}/manage`}
            className="btn btn-primary btn-sm"
          >
            Manage Campaign
          </Link>
          {campaign.blockchainTxHash && (
            <a 
              href={`https://explorer.testnet.near.org/transactions/${campaign.blockchainTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-xs"
              title="View on blockchain"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Blockchain
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Campaigns</h1>
        <div className="flex gap-2">
          <Link href="/campaign" className="btn btn-outline">
            Dashboard
          </Link>
          <button
            onClick={() => router.push('/campaign/new')}
            className="btn btn-primary"
          >
            Create New Campaign
          </button>
        </div>
      </div>

      {/* Campaign Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stat bg-base-200 rounded-box shadow">
          <div className="stat-title">Active Campaigns</div>
          <div className="stat-value text-success">{activeCampaigns.length}</div>
        </div>
        <div className="stat bg-base-200 rounded-box shadow">
          <div className="stat-title">Upcoming</div>
          <div className="stat-value text-warning">{upcomingCampaigns.length}</div>
        </div>
        <div className="stat bg-base-200 rounded-box shadow">
          <div className="stat-title">Ended</div>
          <div className="stat-value text-error">{endedCampaigns.length}</div>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No campaigns found.</p>
          <button
            onClick={() => router.push('/campaign/new')}
            className="btn btn-primary mt-4"
          >
            Create Your First Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {activeCampaigns.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Active Campaigns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCampaigns.map(campaign => (
                  <CampaignCard key={campaign._id} campaign={campaign} />
                ))}
              </div>
            </section>
          )}

          {upcomingCampaigns.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Upcoming Campaigns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingCampaigns.map(campaign => (
                  <CampaignCard key={campaign._id} campaign={campaign} />
                ))}
              </div>
            </section>
          )}

          {endedCampaigns.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Ended Campaigns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {endedCampaigns.map(campaign => (
                  <CampaignCard key={campaign._id} campaign={campaign} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveCampaignsPage;
