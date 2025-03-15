'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNear } from '@/context/NearContext';
import Link from 'next/link';
import CountdownTimer from '@/components/CountdownTimer';

interface VoteHistory {
  _id?: string;
  campaignId: string;
  campaignName: string;
  candidateVoted: string;
  voteDate: string;
  publicKey: string;
  blockchainTxHash?: string;
  verificationHash?: string;
  status?: 'completed' | 'verified';
  campaignDetails?: {
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: 'draft' | 'active' | 'ended' | 'upcoming';
    totalVotes?: number;
    candidates?: Array<{
      _id: string;
      name: string;
      description?: string;
      voteCount: number;
    }>;
  };
}

const VoterHistoryPage = () => {
  const router = useRouter();
  const { isSignedIn, wallet, accountId } = useNear();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<VoteHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedVote, setExpandedVote] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is signed in
    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    const fetchVotingHistory = async () => {
      try {
        // Fetch voting history from API
        const response = await fetch(`/api/votes/history?accountId=${accountId}&includeDetails=true`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch voting history');
        }
        
        const data = await response.json();
        console.log('Voting history data:', data);
        setHistory(data.history || []);
      } catch (err) {
        console.error('Error fetching voting history:', err);
        setError('Failed to load your voting history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVotingHistory();
  }, [isSignedIn, accountId, router]);

  const toggleExpandVote = (campaignId: string) => {
    if (expandedVote === campaignId) {
      setExpandedVote(null);
    } else {
      setExpandedVote(campaignId);
    }
  };

  const getCampaignStatus = (startDate?: string, endDate?: string): 'draft' | 'active' | 'ended' | 'upcoming' => {
    if (!startDate || !endDate) return 'draft';
    
    const now = new Date().getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'active';
  };

  if (!isSignedIn) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div className="h-10 w-1/3 bg-base-200 animate-pulse rounded"></div>
          <div className="h-10 w-1/4 bg-base-200 animate-pulse rounded"></div>
        </div>
        
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="h-8 w-1/3 bg-base-200 animate-pulse rounded"></div>
                  <div className="h-8 w-1/6 bg-base-200 animate-pulse rounded"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">
                  <div>
                    <div className="h-4 w-1/4 bg-base-200 animate-pulse rounded mb-2"></div>
                    <div className="h-6 w-1/2 bg-base-200 animate-pulse rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 w-1/4 bg-base-200 animate-pulse rounded mb-2"></div>
                    <div className="h-6 w-3/4 bg-base-200 animate-pulse rounded"></div>
                  </div>
                </div>
                
                <div className="card-actions justify-end mt-4">
                  <div className="h-8 w-1/6 bg-base-200 animate-pulse rounded"></div>
                  <div className="h-8 w-1/4 bg-base-200 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Voting History</h1>
        <Link href="/voter" className="btn btn-outline">
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}

      {history.length === 0 ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title justify-center">No Voting History</h2>
            <p>You haven't voted in any campaigns yet.</p>
            <div className="card-actions justify-center mt-4">
              <Link href="/voter" className="btn btn-primary">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {history.map((vote, index) => (
            <div key={index} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h2 className="card-title">{vote.campaignName}</h2>
                  <button 
                    className="btn btn-sm btn-ghost"
                    onClick={() => toggleExpandVote(vote.campaignId)}
                  >
                    {expandedVote === vote.campaignId ? 'Show Less' : 'Show More'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm opacity-70">You voted for:</p>
                    <p className="font-semibold">{vote.candidateVoted}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Date voted:</p>
                    <p>{new Date(vote.voteDate).toLocaleDateString()} at {new Date(vote.voteDate).toLocaleTimeString()}</p>
                  </div>
                </div>

                {vote.status && (
                  <div className="mb-4">
                    <p className="text-sm opacity-70">Vote Status:</p>
                    <div className="badge badge-primary">{vote.status}</div>
                  </div>
                )}

                {vote.verificationHash && (
                  <div className="mb-4">
                    <p className="text-sm opacity-70">Verification Hash:</p>
                    <code className="text-xs bg-base-200 p-1 rounded">{vote.verificationHash}</code>
                  </div>
                )}

                {vote.blockchainTxHash && (
                  <div className="mb-4">
                    <p className="text-sm opacity-70">Blockchain Transaction:</p>
                    <a 
                      href={`https://explorer.testnet.near.org/transactions/${vote.blockchainTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary text-xs break-all"
                    >
                      {vote.blockchainTxHash}
                    </a>
                  </div>
                )}

                {expandedVote === vote.campaignId && vote.campaignDetails && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="font-bold text-lg mb-3">Campaign Details</h3>
                    
                    {vote.campaignDetails.description && (
                      <div className="mb-4">
                        <p className="text-sm opacity-70">Description:</p>
                        <p>{vote.campaignDetails.description}</p>
                      </div>
                    )}

                    {vote.campaignDetails.startDate && vote.campaignDetails.endDate && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Campaign Timeline</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p>Start: {new Date(vote.campaignDetails.startDate).toLocaleString()}</p>
                            <p>End: {new Date(vote.campaignDetails.endDate).toLocaleString()}</p>
                            <p className="mt-2">
                              Status: <span className={`badge ${
                                getCampaignStatus(vote.campaignDetails.startDate, vote.campaignDetails.endDate) === 'active' ? 'badge-success' :
                                getCampaignStatus(vote.campaignDetails.startDate, vote.campaignDetails.endDate) === 'ended' ? 'badge-error' :
                                'badge-warning'
                              }`}>{getCampaignStatus(vote.campaignDetails.startDate, vote.campaignDetails.endDate)}</span>
                            </p>
                          </div>
                          {getCampaignStatus(vote.campaignDetails.startDate, vote.campaignDetails.endDate) !== 'ended' && (
                            <div>
                              <h3 className="font-medium mb-2">Time Remaining:</h3>
                              <CountdownTimer 
                                targetDate={new Date(vote.campaignDetails.endDate)}
                                onExpire={() => {}}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {vote.campaignDetails.candidates && vote.campaignDetails.candidates.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Results</h4>
                        <p className="mb-2">Total Votes: {vote.campaignDetails.totalVotes || 0}</p>
                        <div className="space-y-4">
                          {vote.campaignDetails.candidates.map((candidate) => (
                            <div key={candidate._id} className="card bg-base-200">
                              <div className="card-body p-4">
                                <h3 className="font-medium">{candidate.name}</h3>
                                {candidate.description && <p className="text-sm">{candidate.description}</p>}
                                <div className="mt-2">
                                  <progress 
                                    className="progress progress-primary w-full" 
                                    value={candidate.voteCount || 0} 
                                    max={vote.campaignDetails?.totalVotes || 1}
                                  ></progress>
                                  <p className="text-sm mt-1">
                                    {candidate.voteCount || 0} votes 
                                    ({vote.campaignDetails?.totalVotes ? 
                                      (((candidate.voteCount || 0) / vote.campaignDetails.totalVotes) * 100).toFixed(1) : 
                                      0}%)
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="card-actions justify-end mt-4">
                  <Link href={`/voter/${vote.publicKey}`} className="btn btn-outline btn-sm">
                    View Campaign
                  </Link>
                  {vote._id && (
                    <Link href={`/voter/history/${vote._id}`} className="btn btn-primary btn-sm">
                      View Vote Details
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoterHistoryPage;
