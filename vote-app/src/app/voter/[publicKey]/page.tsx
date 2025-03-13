'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNear } from '@/context/NearContext';
import Link from 'next/link';

const VoterCampaignPage = () => {
  const params = useParams<{ publicKey: string }>();
  const router = useRouter();
  const { isSignedIn, wallet } = useNear();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        // First, check if the campaign exists
        const response = await fetch(`/api/campaigns/public/${params.publicKey}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Campaign not found');
          }
          throw new Error('Failed to fetch campaign');
        }
        
        const data = await response.json();
        setCampaign(data);
        
        // If user is signed in, redirect to the vote page
        if (isSignedIn) {
          router.push(`/voter/vote?campaignId=${data.id}`);
        }
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.publicKey) {
      fetchCampaign();
    }
  }, [params.publicKey, isSignedIn, router]);

  const handleLogin = async () => {
    if (wallet) {
      // Store the return URL in localStorage
      localStorage.setItem('returnUrl', `/voter/vote?campaignId=${campaign.id}`);
      
      // Redirect to NEAR wallet for login
      await wallet.signIn();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="alert alert-error max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
          <Link href="/" className="btn btn-primary mt-4">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold">{campaign.name}</h1>
          
          {campaign.description && (
            <p className="mt-2">{campaign.description}</p>
          )}
          
          <div className="mt-4">
            <p className="text-sm opacity-70">
              Campaign runs from {new Date(campaign.startDate).toLocaleDateString()} to {new Date(campaign.endDate).toLocaleDateString()}
            </p>
          </div>
          
          <div className="divider"></div>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Login Required</h2>
            <p className="mb-6">You need to login with your NEAR wallet to vote in this campaign.</p>
            
            <button 
              onClick={handleLogin}
              className="btn btn-primary btn-lg"
            >
              Login with NEAR Wallet
            </button>
            
            <p className="mt-4 text-sm opacity-70">
              Don't have a NEAR wallet? <a href="https://wallet.near.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Create one here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterCampaignPage; 