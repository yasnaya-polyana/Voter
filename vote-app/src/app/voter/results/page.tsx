'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface Candidate {
  id: string;
  name: string;
  description: string;
  voteCount: number;
}

interface Campaign {
  id: string;
  campaignName: string;
  description: string;
  endDate: Date;
  candidates: Candidate[];
  totalVotes: number;
  userVote?: string; // ID of the candidate the user voted for
}

export default function VoterResults() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVotedCampaigns = async () => {
      try {
        const response = await fetch('/api/voter/voted-campaigns');
        if (!response.ok) {
          throw new Error('Failed to fetch voting history');
        }
        const data = await response.json();
        setCampaigns(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchVotedCampaigns();
    }
  }, [user]);

  const calculatePercentage = (votes: number, total: number) => {
    return total === 0 ? 0 : ((votes / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['voter']}>
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Voting History</h1>
          <p className="text-gray-600 mt-2">View results from elections you've participated in</p>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {campaigns.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">No Voting History Found</h2>
              <p>You haven't participated in any elections yet.</p>
              <div className="card-actions justify-end mt-4">
                <a href="/campaign/active" className="btn btn-primary">
                  View Active Campaigns
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title flex justify-between items-start">
                    <span>{campaign.campaignName}</span>
                    <span className="badge badge-primary">Completed</span>
                  </h2>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    Ended on {new Date(campaign.endDate).toLocaleDateString()}
                  </p>
                  
                  <p className="mb-6">{campaign.description}</p>
                  
                  <div className="space-y-6">
                    {campaign.candidates.map((candidate) => (
                      <div 
                        key={candidate.id} 
                        className={`p-4 rounded-lg ${
                          campaign.userVote === candidate.id 
                            ? 'bg-primary bg-opacity-10 border border-primary' 
                            : 'bg-base-200'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{candidate.name}</span>
                            {campaign.userVote === candidate.id && (
                              <span className="badge badge-primary">Your Vote</span>
                            )}
                          </div>
                          <span className="text-sm font-medium">
                            {calculatePercentage(candidate.voteCount, campaign.totalVotes)}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-base-300 rounded-full h-2.5 mb-2">
                          <div 
                            className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${calculatePercentage(candidate.voteCount, campaign.totalVotes)}%` 
                            }}
                          ></div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          {candidate.voteCount} votes
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-base-300">
                    <div className="flex justify-between text-sm">
                      <span>Total Votes Cast:</span>
                      <span className="font-semibold">{campaign.totalVotes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
