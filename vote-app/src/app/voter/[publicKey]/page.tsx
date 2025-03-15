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
        
        // If campaign is private, redirect to vote page with isPrivate flag
        if (!data.isPublic) {
          router.push(`/voter/vote?campaignId=${data.id || data._id}&isPrivate=true`);
          return;
        }
        
        // If campaign exists and is public, redirect to the vote page
        router.push(`/voter/vote?campaignId=${data.id || data._id}`);
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
  }, [params.publicKey, router]);

  const handleLogin = async () => {
    if (wallet) {
      // Store the return URL in localStorage
      localStorage.setItem('returnUrl', `/voter/vote?campaignId=${campaign.id || campaign._id}`);
      
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
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
        <div className="mt-4">
          <Link href="/voter" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return null; // This should never render as we redirect in useEffect
};

export default VoterCampaignPage; 