'use client';

import { useEffect, useState } from 'react';
import { useNear } from '@/context/NearContext';
import { getContract, checkCampaignAndVote } from '@/lib/near-contract';
import Link from 'next/link';

interface VoteHistory {
  campaignId: string;
  candidateId: string;
  timestamp: number;
  campaignTitle?: string;
  transactionHash: string;
}

export default function VoterHistoryPage() {
  const { wallet, isSignedIn, signIn } = useNear();
  const [voteHistory, setVoteHistory] = useState<VoteHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [contractStatus, setContractStatus] = useState<string>('');

  useEffect(() => {
    async function checkContractStatus() {
      if (!wallet || !isSignedIn) return;

      try {
        const contract = getContract(wallet.account());
        console.log('=== Contract Status Check ===');
        console.log('Contract Address:', process.env.NEXT_PUBLIC_NEAR_CONTRACT_NAME);
        console.log('Connected Account:', wallet.getAccountId());
        
        // Try to make a simple view call to verify contract is responsive
        const testCall = await contract.get_voter_history({
          voter_id: wallet.getAccountId()
        });
        
        console.log('Contract is active and responding');
        console.log('Test call result:', testCall);
        setContractStatus('active');
      } catch (error) {
        console.error('Contract check failed:', error);
        setContractStatus('inactive');
      }
    }

    async function loadVoteHistory() {
      if (!wallet || !isSignedIn) return;

      try {
        setLoading(true);
        const contract = getContract(wallet.account());
        
        console.log('=== Detailed Vote History Check ===');
        
        // Check specific transaction
        const specificTxHash = '3rSPSCaTY9VNHfocsQWE1Bt1j4CJ2BhkKVaHkdEXERLk';
        console.log('Looking up transaction:', specificTxHash);
        
        // Get campaign details
        const campaignResult = await contract.get_campaign_results({
          campaign_id: '1' // Replace with your actual campaign ID
        });
        console.log('Campaign Results:', campaignResult);
        
        // Get voter history
        const history = await contract.get_voter_history({
          voter_id: wallet.getAccountId()
        });
        console.log('Voter History:', history);
        
        if (Array.isArray(history)) {
          setVoteHistory(history.map(vote => ({
            ...vote,
            transactionHash: specificTxHash // Include the transaction hash
          })));
        }
      } catch (error) {
        console.error('Detailed history check failed:', error);
        setLoading(false);
      }
    }

    async function verifyVoteDetails() {
      if (wallet && isSignedIn) {
        const details = await checkCampaignAndVote(wallet.account());
        console.log('Vote verification details:', details);
      }
    }

    checkContractStatus();
    loadVoteHistory();
    verifyVoteDetails();
  }, [wallet, isSignedIn]);

  // Add contract status display
  const renderContractStatus = () => (
    <div className={`alert ${contractStatus === 'active' ? 'alert-success' : 'alert-error'} mb-4`}>
      <div className="flex-1">
        <label>Contract Status: {contractStatus}</label>
      </div>
    </div>
  );

  // Render vote history with more details
  const renderVoteHistory = () => (
    <div className="space-y-4">
      {voteHistory.map((vote, index) => (
        <div key={index} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Vote Record #{index + 1}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Campaign ID:</strong> {vote.campaignId}</p>
                <p><strong>Candidate ID:</strong> {vote.candidateId}</p>
              </div>
              <div>
                <p><strong>Timestamp:</strong> {vote.timestamp.toLocaleString()}</p>
                <p>
                  <strong>Transaction:</strong>
                  <a 
                    href={`https://testnet.nearblocks.io/txns/${vote.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary ml-2"
                  >
                    View on NEAR Explorer
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!isSignedIn) {
    return (
      <div className="text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Voting History</h1>
        <button onClick={signIn} className="btn btn-primary">
          Sign in to view your voting history
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Voting History</h1>
      {renderContractStatus()}
      
      {loading ? (
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : voteHistory.length === 0 ? (
        <div className="alert alert-info">
          <div className="flex-1">
            <label>No voting history found. Cast your first vote!</label>
          </div>
        </div>
      ) : (
        renderVoteHistory()
      )}
    </div>
  );
}
