'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Campaign {
  id: string;
  campaignName: string;
  createdBy: string;
  startDate: string;
  endDate: string;
}

const CampaignIDManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/campaigns/user/${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch campaigns');
        }
        const data = await response.json();
        setCampaigns(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load campaigns');
        console.error('Error fetching campaigns:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [user]);

  const getCampaignStatus = (startDate: string, endDate: string): string => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'Upcoming';
    if (now > end) return 'Completed';
    return 'Active';
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Campaign IDs</h2>
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Campaign IDs</h2>
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Campaign IDs</h2>
        <p className="text-gray-600">You haven't created any campaigns yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Campaign IDs</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Campaign ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => {
              const status = getCampaignStatus(campaign.startDate, campaign.endDate);
              return (
                <tr key={campaign.id}>
                  <td>{campaign.campaignName}</td>
                  <td>
                    <code className="bg-base-200 px-2 py-1 rounded">
                      {campaign.id}
                    </code>
                  </td>
                  <td>
                    <span className={`badge ${
                      status === 'Active' ? 'badge-success' :
                      status === 'Upcoming' ? 'badge-warning' :
                      'badge-neutral'
                    }`}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignIDManager;
