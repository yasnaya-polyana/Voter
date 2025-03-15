'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNear } from '@/context/NearContext';
import Link from 'next/link';
import CountdownTimer from '@/components/CountdownTimer';

interface VoteDetails {
  _id: string;
  campaignId: string;
  campaignName: string;
  candidateVoted: string;
  voteDate: string;
  publicKey: string;
  status: 'completed' | 'verified';
  verificationHash?: string;
  blockchainTxHash?: string;
  campaign: {
    _id: string;
    campaignName: string;
    description: string;
    isPublic: boolean;
    publicKey: string;
    startDate: string;
    endDate: string;
    status: 'draft' | 'active' | 'ended' | 'upcoming';
    totalVotes: number;
    candidates: Array<{
      _id: string;
      name: string;
      description: string;
      voteCount: number;
    }>;
    blockchainId?: string;
    blockchainTxHash?: string;
  };
}

const getCampaignStatus = (startDate: string, endDate: string): 'draft' | 'active' | 'ended' | 'upcoming' => {
  const now = new Date().getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
};

const VoteDetailsPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { isSignedIn, accountId } = useNear();
  const [voteDetails, setVoteDetails] = useState<VoteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVoteDetails = async () => {
    try {
      // Fetch vote details from API
      const response = await fetch(`/api/votes/${params.id}?accountId=${accountId}&_t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch vote details');
      }
      
      const data = await response.json();
      console.log('Vote details data:', data);
      setVoteDetails(data.vote);
    } catch (err) {
      console.error('Error fetching vote details:', err);
      setError('Failed to load vote details. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Check if user is signed in
    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    fetchVoteDetails();
  }, [isSignedIn, accountId, params.id, router]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVoteDetails();
  };

  if (!isSignedIn) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Loading vote details...</p>
        </div>
      </div>
    );
  }

  if (error || !voteDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error || 'Vote details not found'}</span>
        </div>
        <Link href="/voter/history" className="btn btn-primary">
          Back to History
        </Link>
      </div>
    );
  }

  // Parse dates once for use in the component
  const startDate = new Date(voteDetails.campaign.startDate);
  const endDate = new Date(voteDetails.campaign.endDate);
  const voteDate = new Date(voteDetails.voteDate);
  
  // Find the candidate that was voted for
  const votedCandidate = voteDetails.campaign.candidates.find(
    candidate => candidate.name === voteDetails.candidateVoted
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vote Details</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh} 
            className="btn btn-circle btn-outline"
            disabled={refreshing}
          >
            {refreshing ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
          <Link href="/voter/history" className="btn btn-outline">
            Back to History
          </Link>
        </div>
      </div>

      {/* Vote Information */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Your Vote</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <h3 className="font-bold mb-2">Campaign</h3>
              <p className="text-lg">{voteDetails.campaignName}</p>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">You Voted For</h3>
              <p className="text-lg">{voteDetails.candidateVoted}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <h3 className="font-bold mb-2">Vote Date</h3>
              <p>{voteDate.toLocaleDateString()} at {voteDate.toLocaleTimeString()}</p>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">Vote Status</h3>
              <div className="badge badge-lg badge-primary">{voteDetails.status}</div>
            </div>
          </div>
          
          {voteDetails.verificationHash && (
            <div className="mb-4">
              <h3 className="font-bold mb-2">Verification Hash</h3>
              <div className="bg-base-200 p-3 rounded-lg">
                <code className="text-xs break-all">{voteDetails.verificationHash}</code>
              </div>
            </div>
          )}
          
          {voteDetails.blockchainTxHash && (
            <div>
              <h3 className="font-bold mb-2">Blockchain Transaction</h3>
              <div className="bg-base-200 p-3 rounded-lg">
                <a 
                  href={`https://explorer.testnet.near.org/transactions/${voteDetails.blockchainTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary text-xs break-all"
                >
                  {voteDetails.blockchainTxHash}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Information */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Campaign Information</h2>
          
          <div className="mb-4">
            <h3 className="font-bold mb-2">Description</h3>
            <p>{voteDetails.campaign.description}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-bold mb-2">Campaign Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>Start: {startDate.toLocaleString()}</p>
                <p>End: {endDate.toLocaleString()}</p>
                <p className="mt-2">
                  Status: <span className={`badge ${
                    getCampaignStatus(voteDetails.campaign.startDate, voteDetails.campaign.endDate) === 'active' ? 'badge-success' :
                    getCampaignStatus(voteDetails.campaign.startDate, voteDetails.campaign.endDate) === 'ended' ? 'badge-error' :
                    'badge-warning'
                  }`}>{getCampaignStatus(voteDetails.campaign.startDate, voteDetails.campaign.endDate)}</span>
                </p>
              </div>
              {getCampaignStatus(voteDetails.campaign.startDate, voteDetails.campaign.endDate) !== 'ended' && (
                <div>
                  <h3 className="font-medium mb-2">Time Remaining:</h3>
                  <CountdownTimer 
                    targetDate={endDate}
                    onExpire={() => {}}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Campaign Keys</h3>
            <div className="mb-2">
              <span className="text-sm font-medium">Public Key: </span>
              <code className="px-2 py-1 bg-base-300 rounded font-mono text-xs">
                {voteDetails.campaign.publicKey}
              </code>
            </div>
            
            {voteDetails.campaign.blockchainId && (
              <div>
                <span className="text-sm font-medium">Blockchain ID: </span>
                <code className="px-2 py-1 bg-base-300 rounded font-mono text-xs">
                  {voteDetails.campaign.blockchainId}
                </code>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {voteDetails.campaign.candidates && voteDetails.campaign.candidates.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Results</h4>
          <p className="mb-2">
            Last updated: {new Date().toLocaleTimeString()}
            <button 
              onClick={handleRefresh} 
              className="btn btn-xs btn-outline ml-2"
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </p>
          <p className="mb-2">Total Votes: {voteDetails.campaign.totalVotes || 0}</p>
          <div className="space-y-4">
            {voteDetails.campaign.candidates.map((candidate) => (
              <div key={candidate._id} className={`card bg-base-200 ${candidate.name === voteDetails.candidateVoted ? 'border-2 border-primary' : ''}`}>
                <div className="card-body p-4">
                  <h3 className="font-medium">{candidate.name}</h3>
                  {candidate.description && <p className="text-sm">{candidate.description}</p>}
                  <div className="mt-2">
                    <progress 
                      className="progress progress-primary w-full" 
                      value={candidate.voteCount || 0} 
                      max={voteDetails.campaign.totalVotes || 1}
                    ></progress>
                    <p className="text-sm mt-1">
                      {candidate.voteCount || 0} votes 
                      ({voteDetails.campaign.totalVotes ? 
                        (((candidate.voteCount || 0) / voteDetails.campaign.totalVotes) * 100).toFixed(1) : 
                        0}%)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-actions justify-between mt-6">
        <Link href="/voter/history" className="btn btn-outline">
          Back to History
        </Link>
        <button 
          onClick={handleRefresh} 
          className="btn btn-primary"
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Refreshing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Vote Counts
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VoteDetailsPage;