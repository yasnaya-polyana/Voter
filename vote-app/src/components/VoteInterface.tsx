'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNear } from '../context/NearContext';
import { getContract } from '../lib/near-contract';

interface VoteInterfaceProps {
  campaignId: string;
  candidates: Array<any>; // Accept any candidate format
  isPrivate?: boolean;
  privateKey?: string;
  publicKey?: string;
}

const VoteInterface: React.FC<VoteInterfaceProps> = ({ 
  campaignId, 
  candidates, 
  isPrivate,
  privateKey,
  publicKey
}) => {
  const router = useRouter();
  const { wallet, isSignedIn, signIn, accountId } = useNear();
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [formattedCandidates, setFormattedCandidates] = useState<any[]>([]);

  // Format candidates to ensure they have consistent ID properties
  useEffect(() => {
    if (candidates && candidates.length > 0) {
      const formatted = candidates.map((candidate, index) => {
        // Ensure each candidate has a consistent ID
        const id = candidate._id || candidate.id || String(index);
        return {
          ...candidate,
          id: id.toString(), // Convert to string to be safe
          _id: id.toString(),
          index: index // Add index as a fallback identifier
        };
      });
      setFormattedCandidates(formatted);
      console.log('Formatted candidates:', formatted);
    }
  }, [candidates]);

  const handleVote = async () => {
    if (!isSignedIn) {
      signIn();
      return;
    }

    if (!selectedCandidate) {
      setVoteError('Please select a candidate');
      return;
    }

    setLoading(true);
    setVoteError(null);
    
    try {
      // Find the selected candidate to get all its properties
      const candidate = formattedCandidates.find(c => c.id === selectedCandidate);
      
      if (!candidate) {
        throw new Error('Selected candidate not found');
      }
      
      console.log('Submitting vote for candidate:', candidate);
      
      // Use the server-side API to handle the vote
      const response = await fetch(`/api/campaigns/${campaignId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: selectedCandidate,
          candidateName: candidate.name, // Include name as fallback
          candidateIndex: candidate.index, // Include index as fallback
          publicKey: publicKey,
          privateKey: isPrivate ? privateKey : undefined,
          voterAccountId: accountId
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cast vote');
      }
      
      // Vote successful
      setVoteSuccess(true);
      
      // Redirect to history page after a short delay
      setTimeout(() => {
        router.push('/voter/history');
      }, 2000);
      
    } catch (error) {
      console.error('Error casting vote:', error);
      setVoteError(error.message || 'Failed to cast vote');
    } finally {
      setLoading(false);
    }
  };

  // If vote was successful, show success message
  if (voteSuccess) {
    return (
      <div className="text-center py-8">
        <div className="text-success text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-4">Vote Cast Successfully!</h2>
        <p className="mb-6">Your vote has been recorded.</p>
        <p>Redirecting to your voting history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Cast Your Vote</h2>
      
      {voteError && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{voteError}</span>
        </div>
      )}
      
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-base-200 p-4 rounded-lg mb-4">
          <p>Debug Info:</p>
          <p>Campaign ID: {campaignId}</p>
          <p>Public Key: {publicKey}</p>
          <p>Is Private: {isPrivate ? 'Yes' : 'No'}</p>
          <p>Selected Candidate: {selectedCandidate}</p>
          <p>Candidates Count: {formattedCandidates.length}</p>
        </div>
      )}

      {!isSignedIn ? (
        <button onClick={signIn} className="btn btn-primary">
          Connect NEAR Wallet to Vote
        </button>
      ) : (
        <>
          <div className="space-y-4">
            {formattedCandidates.map((candidate) => (
              <div key={candidate.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">{candidate.name}</h3>
                  {candidate.description && <p>{candidate.description}</p>}
                  <div className="card-actions justify-end">
                    <button
                      className={`btn ${selectedCandidate === candidate.id ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setSelectedCandidate(candidate.id)}
                      disabled={loading}
                    >
                      Select
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedCandidate && (
            <button
              className="btn btn-primary w-full"
              onClick={handleVote}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                'Submit Vote'
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default VoteInterface; 