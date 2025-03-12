'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNear } from '../context/NearContext';
import { getContract } from '../lib/near-contract';
import { utils } from 'near-api-js';

interface VoteInterfaceProps {
  campaignId: string;
  candidates: Array<{ id: string; name: string; description: string }>;
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
  const { wallet, isSignedIn, signIn } = useNear();
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleVote = async () => {
    if (!isSignedIn) {
      signIn();
      return;
    }

    if (!selectedCandidate || !publicKey) {
      alert('Please select a candidate and ensure public key is available');
      return;
    }

    setLoading(true);
    try {
      // First, get the campaign details to retrieve the blockchain ID
      const campaignResponse = await fetch(`/api/campaigns/${campaignId}`);
      if (!campaignResponse.ok) {
        throw new Error('Failed to fetch campaign details');
      }
      
      const campaignData = await campaignResponse.json();
      const blockchainId = campaignData.blockchainId;
      
      if (!blockchainId) {
        throw new Error('Campaign is not configured for blockchain voting');
      }
      
      console.log('Using blockchain ID for voting:', blockchainId);
      
      // Get the contract instance
      const contract = getContract(wallet.account());
      
      console.log('Initiating vote transaction with args:', {
        campaign_id: blockchainId,
        candidate_id: selectedCandidate.toString(),
        public_key: publicKey.toString().trim().toUpperCase()
      });

      // Call the contract method with the blockchain ID
      await contract.cast_vote({
        campaign_id: blockchainId,
        candidate_id: selectedCandidate.toString(),
        public_key: publicKey.toString().trim().toUpperCase()
      }, '300000000000000', '1000000000000000000000');

      // Handle successful transaction
      router.push('/voter/history');
    } catch (error: any) {
      console.error('Error in voting process:', error);
      setLoading(false);
      alert(`Failed to cast vote: ${error.message || 'Unknown error'}`);
    }
  };

  // Add a useEffect to handle the return from wallet
  useEffect(() => {
    const handleWalletReturn = async () => {
      // Check if we're returning from a wallet transaction
      const urlParams = new URLSearchParams(window.location.search);
      const transactionHashes = urlParams.get('transactionHashes');

      if (transactionHashes) {
        try {
          // Record the vote in the database
          const response = await fetch(`/api/campaigns/${campaignId}/vote`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              candidateId: selectedCandidate,
              publicKey,
              privateKey: isPrivate ? privateKey : undefined,
              transactionHash: transactionHashes
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to record vote in database');
          }

          // Redirect to history page
          router.push('/voter/history');
        } catch (error) {
          console.error('Error recording vote:', error);
        }
      }
    };

    handleWalletReturn();
  }, [campaignId, selectedCandidate, publicKey, privateKey, isPrivate, router]);

  useEffect(() => {
    console.log('VoteInterface Props:', {
      campaignId,
      publicKey,
      isPrivate,
      hasPrivateKey: !!privateKey,
      selectedCandidate
    });
  }, [campaignId, publicKey, isPrivate, privateKey, selectedCandidate]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Cast Your Vote</h2>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-base-200 p-4 rounded-lg mb-4">
          <p>Debug Info:</p>
          <p>Campaign ID: {campaignId}</p>
          <p>Public Key: {publicKey}</p>
          <p>Is Private: {isPrivate ? 'Yes' : 'No'}</p>
          <p>Selected Candidate: {selectedCandidate}</p>
        </div>
      )}

      {!isSignedIn ? (
        <button onClick={signIn} className="btn btn-primary">
          Connect NEAR Wallet to Vote
        </button>
      ) : (
        <>
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">{candidate.name}</h3>
                  <p>{candidate.description}</p>
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
              disabled={loading || !publicKey}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                'Submit Vote to Blockchain'
              )}
            </button>
          )}

          {!publicKey && (
            <div className="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Public key is required to cast a vote</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VoteInterface; 