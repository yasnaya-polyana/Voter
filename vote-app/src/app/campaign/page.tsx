'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import CountdownTimer from '../../components/CountdownTimer';

interface Campaign {
  _id: string;
  campaignName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'upcoming' | 'active' | 'ended';
  isPublic: boolean;
  totalVotes?: number;
  publicKey: string;
  candidateCount?: number;
  blockchainId?: string;
  blockchainTxHash?: string;
}

const CampaignPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define the User interface to match what's actually in the AuthContext
  interface User {
    id: string;
    email: string;
    userType: 'voter' | 'campaign' | 'admin';
  }

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user) {
        console.log('No user available, waiting for authentication...');
        return;
      }
      
      console.log('User info:', user);
      
      // We'll directly fetch all campaigns and filter by email
      try {
        console.log('Fetching all campaigns');
        const response = await fetch('/api/campaigns/all');
        
        if (!response.ok) {
          console.error('Failed to fetch all campaigns with status:', response.status);
          throw new Error('Failed to fetch campaigns');
        }
        
        const data = await response.json();
        console.log('All campaigns fetched:', data.length, 'total campaigns');
        
        // Filter campaigns by user email
        const userCampaigns = data
          .filter((campaign: any) => {
            const matches = campaign.createdBy === user.email;
            console.log('Campaign:', campaign._id || campaign.id, 'createdBy:', campaign.createdBy, 'user email:', user.email, 'matches:', matches);
            return matches;
          })
          .map((campaign: any) => ({
            _id: campaign.id || campaign._id,
            campaignName: campaign.campaignName,
            description: campaign.description || '',
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            isPublic: campaign.isPublic,
            totalVotes: campaign.totalVotes || 0,
            publicKey: campaign.publicKey,
            status: campaign.status || calculateStatus(campaign.startDate, campaign.endDate),
            candidateCount: campaign.candidateCount || campaign.candidates?.length || 0,
            blockchainId: campaign.blockchainId,
            blockchainTxHash: campaign.blockchainTxHash
          }));
        
        console.log('User campaigns filtered:', userCampaigns.length);
        setCampaigns(userCampaigns);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };

    // Helper function to calculate status
    const calculateStatus = (startDate: string, endDate: string): 'draft' | 'upcoming' | 'active' | 'ended' => {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (now < start) return 'upcoming';
      if (now > end) return 'ended';
      return 'active';
    };

    fetchCampaigns();
  }, [user]);

  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active');
  const upcomingCampaigns = campaigns.filter(campaign => campaign.status === 'upcoming');
  const endedCampaigns = campaigns.filter(campaign => campaign.status === 'ended');

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">Campaign Management</h1>
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Campaign Management</h1>
        <Link href="/campaign/new" className="btn btn-primary">
          Create New Campaign
        </Link>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}

      {/* Campaign Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-base-200 rounded-box shadow">
          <div className="stat-title">Total Campaigns</div>
          <div className="stat-value">{campaigns.length}</div>
        </div>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/campaign/active" className="btn btn-primary btn-lg">
          View Active Campaigns
        </Link>
        <Link href="/campaign/new" className="btn btn-secondary btn-lg">
          Add New Campaign
        </Link>
        <Link href="/campaign/past" className="btn btn-outline btn-lg">
          View Past Campaigns
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title justify-center">No Campaigns Yet</h2>
            <p>You haven't created any campaigns yet. Get started by creating your first campaign.</p>
            <div className="card-actions justify-center mt-4">
              <Link href="/campaign/new" className="btn btn-primary">
                Create Your First Campaign
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Campaigns */}
          {activeCampaigns.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Active Campaigns</h2>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Campaign Name</th>
                        <th>End Date</th>
                        <th>Time Remaining</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeCampaigns.map((campaign) => (
                        <tr key={campaign._id}>
                          <td>
                            <div className="font-bold">{campaign.campaignName}</div>
                            <div className="text-sm opacity-70">ID: {campaign.publicKey}</div>
                            <div className="flex gap-1 mt-1">
                              <div className="badge badge-xs badge-outline">
                                {campaign.isPublic ? 'Public' : 'Private'}
                              </div>
                              {campaign.candidateCount && (
                                <div className="badge badge-xs badge-outline">
                                  {campaign.candidateCount} candidates
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{new Date(campaign.endDate).toLocaleDateString()}</td>
                          <td>
                            <CountdownTimer 
                              targetDate={new Date(campaign.endDate)}
                              onExpire={() => {}}
                            />
                          </td>
                          <td>
                            <Link 
                              href={`/campaign/${campaign._id}/manage`}
                              className="btn btn-primary btn-sm"
                            >
                              Manage
                            </Link>
                            {campaign.blockchainTxHash && (
                              <a 
                                href={`https://explorer.testnet.near.org/transactions/${campaign.blockchainTxHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline btn-xs mt-1"
                                title="View on blockchain"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Campaigns */}
          {upcomingCampaigns.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Upcoming Campaigns</h2>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Campaign Name</th>
                        <th>Start Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingCampaigns.map((campaign) => (
                        <tr key={campaign._id}>
                          <td>
                            <div className="font-bold">{campaign.campaignName}</div>
                            <div className="text-sm opacity-70">ID: {campaign.publicKey}</div>
                            <div className="flex gap-1 mt-1">
                              <div className="badge badge-xs badge-outline">
                                {campaign.isPublic ? 'Public' : 'Private'}
                              </div>
                              {campaign.candidateCount && (
                                <div className="badge badge-xs badge-outline">
                                  {campaign.candidateCount} candidates
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{new Date(campaign.startDate).toLocaleDateString()}</td>
                          <td>
                            <div className="badge badge-warning">Upcoming</div>
                          </td>
                          <td>
                            <Link 
                              href={`/campaign/${campaign._id}/manage`}
                              className="btn btn-primary btn-sm"
                            >
                              Manage
                            </Link>
                            {campaign.blockchainTxHash && (
                              <a 
                                href={`https://explorer.testnet.near.org/transactions/${campaign.blockchainTxHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline btn-xs mt-1"
                                title="View on blockchain"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Ended Campaigns */}
          {endedCampaigns.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Ended Campaigns</h2>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Campaign Name</th>
                        <th>End Date</th>
                        <th>Total Votes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {endedCampaigns.map((campaign) => (
                        <tr key={campaign._id}>
                          <td>
                            <div className="font-bold">{campaign.campaignName}</div>
                            <div className="text-sm opacity-70">ID: {campaign.publicKey}</div>
                            <div className="flex gap-1 mt-1">
                              <div className="badge badge-xs badge-outline">
                                {campaign.isPublic ? 'Public' : 'Private'}
                              </div>
                              {campaign.candidateCount && (
                                <div className="badge badge-xs badge-outline">
                                  {campaign.candidateCount} candidates
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{new Date(campaign.endDate).toLocaleDateString()}</td>
                          <td>{campaign.totalVotes || 0}</td>
                          <td>
                            <Link 
                              href={`/campaign/${campaign._id}/manage`}
                              className="btn btn-primary btn-sm"
                            >
                              View Results
                            </Link>
                            {campaign.blockchainTxHash && (
                              <a 
                                href={`https://explorer.testnet.near.org/transactions/${campaign.blockchainTxHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline btn-xs mt-1"
                                title="View on blockchain"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProtectedCampaignPage = () => (
  <ProtectedRoute allowedUserTypes={['campaign']}>
    <CampaignPage />
  </ProtectedRoute>
);

export default ProtectedCampaignPage;
