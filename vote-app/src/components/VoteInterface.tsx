'use client';

import React, { useState } from 'react';
import { useNear } from '../context/NearContext';
import { getContract } from '../lib/near-contract';
import { utils } from 'near-api-js';

interface VoteInterfaceProps {
  campaignId: string;
  candidates: Array<{ id: string; name: string }>;
  isPrivate?: boolean;
}

const VoteInterface: React.FC<VoteInterfaceProps> = ({ 
  campaignId, 
  candidates, 
  isPrivate
}) => {
  const { wallet, isSignedIn, signIn } = useNear();
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [privateKey, setPrivateKey] = useState('');

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
      
      // Prepare vote arguments
      const voteArgs = {
        campaign_id: campaignId,
        candidate_id: selectedCandidate,
        ...(isPrivate && { private_key: privateKey })
      };

      // Call the contract method with appropriate gas
      const VOTE_GAS = '50000000000000'; // 50 TGas
      const result = await contract.cast_vote(
        voteArgs,
        VOTE_GAS,
        utils.format.parseNearAmount('0.001') // Small deposit for storage
      );

      console.log('Vote transaction result:', result);
      alert('Vote cast successfully!');
      setSelectedCandidate('');
      setPrivateKey('');
    } catch (error: any) {
      console.error('Error casting vote:', error);
      alert(error.message || 'Failed to cast vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <select
        value={selectedCandidate}
        onChange={(e) => setSelectedCandidate(e.target.value)}
        className="select select-bordered w-full"
      >
        <option value="">Select a candidate</option>
        {candidates.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>
            {candidate.name}
          </option>
        ))}
      </select>

      {isPrivate && (
        <input
          type="password"
          placeholder="Enter your private key"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          className="input input-bordered w-full"
        />
      )}

      <button
        onClick={handleVote}
        disabled={loading || !selectedCandidate || (isPrivate && !privateKey)}
        className="btn btn-primary w-full"
      >
        {loading ? 'Casting Vote...' : 'Cast Vote'}
      </button>
    </div>
  );
};

export default VoteInterface; 