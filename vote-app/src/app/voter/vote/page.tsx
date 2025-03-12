// 8693DD7F
'use client';

import React, { useState, useEffect } from 'react';
import CountdownTimer from '../../../components/CountdownTimer';
import VoteInterface from '../../../components/VoteInterface';
import { useNear } from '../../../context/NearContext';
import { useRouter } from 'next/navigation';
import { getContract } from '../../../lib/near-contract';
import { utils } from 'near-api-js';

interface Campaign {
  id: string;
  campaignName: string;
  description: string;
  isPublic: boolean;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'ended';
  announcements: Array<{
    content: string;
    createdAt: string;
  }>;
}

interface Candidate {
  _id: string;
  name: string;
  description: string;
  voteCount: number;
}

const VotePage: React.FC = () => {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [showPrivateKeyForm, setShowPrivateKeyForm] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const { wallet, isSignedIn } = useNear();

  const handlePublicKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/campaigns/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          publicKey: publicKey.toUpperCase() 
        }),
      });

      if (!response.ok) {
        throw new Error('Campaign not found');
      }

      const data = await response.json();
      console.log('Campaign data:', data); // Debug log

      // Format the dates properly
      const formattedCampaign = {
        ...data,
        startDate: data.startDate,
        endDate: data.endDate
      };

      setCampaign(formattedCampaign);

      // If it's a public campaign, load candidates immediately
      if (data.isPublic) {
        const candidatesResponse = await fetch(`/api/campaigns/${data.id}/candidates`);
        if (!candidatesResponse.ok) {
          throw new Error('Failed to load candidates');
        }
        const candidatesData = await candidatesResponse.json();
        setCandidates(candidatesData.candidates);
      } else {
        setShowPrivateKeyForm(true);
      }
    } catch (error) {
      setError(error.message || 'Invalid Public Key');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!campaign) throw new Error('No campaign selected');

      const response = await fetch(`/api/campaigns/${campaign.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          privateKey: privateKey.toUpperCase() 
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid private key');
      }

      await loadCandidates(campaign.id);
      setShowPrivateKeyForm(false);
    } catch (error) {
      setError(error.message || 'Invalid Private Key');
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/candidates`);
      if (!response.ok) {
        throw new Error('Failed to load candidates');
      }
      const data = await response.json();
      setCandidates(data.candidates);
    } catch (error) {
      setError('Failed to load candidates. Please try again.');
      throw error;
    }
  };

  const handleVote = async (candidateId: string) => {
    if (!campaign) {
      console.error('No campaign selected');
      return;
    }

    if (!isSignedIn) {
      console.log('User not signed in, redirecting...');
      router.push('/login');
      return;
    }

    setVotingInProgress(true);
    setError('');

    try {
      console.log('Vote parameters:', {
        campaignId: campaign.id,
        candidateId,
        publicKey
      });

      // Get the contract instance
      const contract = getContract(wallet.account());

      // Call the contract method directly with properly formatted arguments
      await contract.cast_vote({
        campaign_id: campaign.id,
        candidate_id: candidateId,
        public_key: publicKey.trim().toUpperCase()
      }, '300000000000000', '1000000000000000000000');

      // After successful blockchain transaction, update database
      const response = await fetch(`/api/campaigns/${campaign.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          publicKey,
          privateKey: campaign.isPublic ? undefined : privateKey
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record vote in database');
      }

      // Redirect to history page
      router.push('/voter/history');
    } catch (error: any) {
      console.error('Error in voting process:', error);
      setError(error.message || 'Failed to submit vote');
    } finally {
      setVotingInProgress(false);
    }
  };

  const isCampaignOpen = (campaign: Campaign) => {
    const now = new Date().getTime();
    const start = new Date(campaign.startDate).getTime();
    const end = new Date(campaign.endDate).getTime();
    return now >= start && now <= end;
  };

  const getCampaignStatus = (campaign: Campaign) => {
    const now = new Date().getTime();
    const start = new Date(campaign.startDate).getTime();
    const end = new Date(campaign.endDate).getTime();

    if (now < start) return 'Not started';
    if (now > end) return 'Ended';
    return 'Active';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Vote in a Campaign</h1>
      
      {!campaign ? (
        <form onSubmit={handlePublicKeySubmit} className="max-w-md mx-auto">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Enter Campaign Public Key</span>
            </label>
            <input
              type="text"
              placeholder="Enter public key (e.g., 57291826)"
              className="input input-bordered font-mono"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value.toUpperCase())}
              maxLength={8}
              pattern="[A-F0-9]{8}"
              required
            />
            <label className="label">
              <span className="label-text-alt"> Your public key is 8 characters long number. If you have a private key, please enter your public key first.</span>
            </label>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary mt-4 w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner"></span>
                Accessing Campaign...
              </>
            ) : (
              'Access Campaign'
            )}
          </button>
        </form>
      ) : showPrivateKeyForm ? (
        <form onSubmit={handlePrivateKeySubmit} className="max-w-md mx-auto">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Enter Private Key</span>
            </label>
            <input
              type="text"
              placeholder="Enter private key"
              className="input input-bordered font-mono"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value.toUpperCase())}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary mt-4 w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner"></span>
                Verifying...
              </>
            ) : (
              'Verify Private Key'
            )}
          </button>
        </form>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="bg-base-100 shadow-xl rounded-box p-6 mb-6">
            <h2 className="text-2xl font-bold mb-2">{campaign.campaignName}</h2>
            <p className="text-base-content/70 mb-4">{campaign.description}</p>
            
            <div className="divider"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold mb-2">Campaign Timeline</h3>
                <p>Start: {new Date(campaign.startDate).toLocaleString()}</p>
                <p>End: {new Date(campaign.endDate).toLocaleString()}</p>
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">
                    {isCampaignOpen(campaign) ? 'Time Remaining:' : 'Campaign Status:'}
                  </h4>
                  {isCampaignOpen(campaign) ? (
                    <CountdownTimer 
                      targetDate={new Date(campaign.endDate)}
                      onExpire={() => setShowResults(true)}
                    />
                  ) : (
                    <div className="badge badge-lg">
                      {new Date().getTime() < new Date(campaign.startDate).getTime() 
                        ? 'Not Started' 
                        : 'Ended'}
                    </div>
                  )}
                </div>
              </div>
              
              {campaign.announcements?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Announcements</h3>
                  <div className="space-y-2">
                    {campaign.announcements.map((announcement, index) => (
                      <div key={index} className="bg-base-200 p-3 rounded-lg">
                        <p>{announcement.content}</p>
                        <p className="text-sm text-base-content/60 mt-1">
                          {new Date(announcement.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {isCampaignOpen(campaign) ? (
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Candidates</h3>
              {candidates.map((candidate) => (
                <div key={candidate._id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title">{candidate.name}</h3>
                    <p>{candidate.description}</p>
                    <div className="card-actions justify-end">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleVote(candidate._id)}
                        disabled={votingInProgress || !isSignedIn}
                      >
                        {votingInProgress ? (
                          <span className="loading loading-spinner"></span>
                        ) : (
                          'Vote on Blockchain'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : showResults || !isCampaignOpen(campaign) ? (
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Results</h3>
              {candidates.map((candidate) => (
                <div key={candidate._id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title">{candidate.name}</h3>
                    <div className="mt-2">
                      <progress 
                        className="progress progress-primary w-full" 
                        value={candidate.voteCount} 
                        max={candidates.reduce((sum, c) => sum + c.voteCount, 0)}
                      ></progress>
                      <p className="text-sm mt-1">
                        {candidate.voteCount} votes
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
      
      {error && (
        <div className="alert alert-error mt-4 max-w-md mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default VotePage;
