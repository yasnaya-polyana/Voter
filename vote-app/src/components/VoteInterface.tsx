'use client';

import React, { useState } from 'react';
import { useNear } from '../context/NearContext';
import { getContract } from '../lib/near-contract';

interface VoteInterfaceProps {
  campaignId: string;
  candidates: Array<{ id: string; name: string }>;
}

const VoteInterface: React.FC<VoteInterfaceProps> = ({ campaignId, candidates }) => {
  const { wallet, isSignedIn, signIn } = useNear();
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleVote = async () => {
    if (!isSignedIn) {
      signIn();
      return;
    }

    if (!selectedCandidate) {
      alert('Please select a candidate');
      return;
    }

    setLoading(true);
    try {
      const contract = getContract(wallet.account());
      await contract.cast_vote({
        campaign_id: campaignId,
        candidate_id: selectedCandidate,
        public_key: publicKey,
        private_key: privateKey // Only for private campaigns
      });

      alert('Vote cast successfully!');
    } catch (error) {
      console.error('Error casting vote:', error);
      alert('Failed to cast vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isSignedIn ? (
        <button onClick={signIn} className="btn btn-primary w-full">
          Connect NEAR Wallet to Vote
        </button>
      ) : (
        <>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Cast Your Vote</h2>
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">{candidate.name}</span>
                      <input
                        type="radio"
                        name="candidate"
                        className="radio"
                        checked={selectedCandidate === candidate.id}
                        onChange={() => setSelectedCandidate(candidate.id)}
                        disabled={loading}
                      />
                    </label>
                  </div>
                ))}
              </div>
              <button
                onClick={handleVote}
                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                disabled={!selectedCandidate || loading}
              >
                {loading ? 'Confirming...' : 'Cast Vote'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VoteInterface; 