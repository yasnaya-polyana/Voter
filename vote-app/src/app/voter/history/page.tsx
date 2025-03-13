'use client';

import React, { useEffect, useState } from 'react';
import { useNear } from '@/context/NearContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface VoteHistoryItem {
  campaignId: string;
  campaignName: string;
  candidateName: string;
  timestamp: string;
}

const VoterHistoryPage: React.FC = () => {
  const { wallet, isSignedIn, signIn } = useNear();
  const router = useRouter();
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaignDetails, setCampaignDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchVoterHistory = async () => {
      try {
        if (!isSignedIn) {
          setLoading(false);
          return;
        }

        const accountId = wallet?.account()?.accountId;
        console.log('Fetching history for account:', accountId);
        
        if (!accountId) {
          setError('Account ID not available');
          setLoading(false);
          return;
        }

        // Fetch voter history from API
        const response = await fetch(`/api/voter/history?account=${accountId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch voter history');
        }
        
        const data = await response.json();
        console.log('Voter history response:', data);
        
        if (data.success && data.history) {
          setHistory(data.history);
          
          // Fetch details for each campaign
          const details: Record<string, any> = {};
          for (const campaignId of data.history) {
            try {
              const campaignResponse = await fetch(`/api/campaigns/blockchain/${campaignId}`);
              if (campaignResponse.ok) {
                const campaignData = await campaignResponse.json();
                details[campaignId] = campaignData;
              }
            } catch (err) {
              console.error(`Error fetching details for campaign ${campaignId}:`, err);
            }
          }
          
          setCampaignDetails(details);
        } else {
          setError(data.error || 'No history data returned');
        }
      } catch (err) {
        console.error('Error fetching voter history:', err);
        setError('Failed to load voting history');
      } finally {
        setLoading(false);
      }
    };

    fetchVoterHistory();
  }, [wallet, isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Voter History</h1>
        <div className="bg-base-200 p-6 rounded-lg shadow-md">
          <p className="mb-4">Please sign in to view your voting history.</p>
          <button 
            onClick={signIn}
            className="btn btn-primary"
          >
            Sign In with NEAR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Voting History</h1>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-base-200 p-6 rounded-lg shadow-md">
          <p>You haven't voted in any campaigns yet.</p>
          <Link href="/campaigns" className="btn btn-primary mt-4">
            Browse Campaigns
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Campaign ID</th>
                  <th>Campaign Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((campaignId) => (
                  <tr key={campaignId}>
                    <td>{campaignId}</td>
                    <td>
                      {campaignDetails[campaignId]?.title || 'Loading...'}
                    </td>
                    <td>
                      <Link 
                        href={`/campaign/${campaignId}`}
                        className="btn btn-sm btn-outline"
                      >
                        View Campaign
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoterHistoryPage;
