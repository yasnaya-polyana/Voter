'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNear } from '@/context/NearContext';
import Link from 'next/link';

interface VoteHistory {
  campaignId: string;
  campaignName: string;
  candidateVoted: string;
  voteDate: string;
  publicKey: string;
}

const VoterHistoryPage = () => {
  const router = useRouter();
  const { isSignedIn, wallet, accountId } = useNear();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<VoteHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is signed in
    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    const fetchVotingHistory = async () => {
      try {
        // Fetch voting history from API
        const response = await fetch(`/api/votes/history?accountId=${accountId}`);
        
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

  if (!isSignedIn) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Loading your voting history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
                <h2 className="card-title">{vote.campaignName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm opacity-70">You voted for:</p>
                    <p className="font-semibold">{vote.candidateVoted}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Date voted:</p>
                    <p>{new Date(vote.voteDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="card-actions justify-end mt-4">
                  <Link href={`/voter/${vote.publicKey}`} className="btn btn-outline btn-sm">
                    View Campaign
                  </Link>
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
