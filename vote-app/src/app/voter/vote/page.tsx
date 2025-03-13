// 8693DD7F
'use client';

import React, { useState, useEffect } from 'react';
import CountdownTimer from '../../../components/CountdownTimer';
import VoteInterface from '../../../components/VoteInterface';
import { useNear } from '../../../context/NearContext';
import { useRouter, useSearchParams } from 'next/navigation';
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

const VotePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, wallet } = useNear();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState('');
  const [privateKeyError, setPrivateKeyError] = useState<string | null>(null);
  
  // Get campaign ID from query parameters
  const campaignId = searchParams.get('campaignId');

  useEffect(() => {
    // Check if user is signed in
    if (!isSignedIn) {
      // Store the return URL
      if (campaignId) {
        localStorage.setItem('returnUrl', `/voter/vote?campaignId=${campaignId}`);
      }
      
      // Redirect to login
      router.push('/login');
      return;
    }
    
    // If no campaign ID, redirect to campaign selection
    if (!campaignId) {
      router.push('/voter/campaigns');
      return;
    }
    
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch campaign');
        }
        
        const data = await response.json();
        setCampaign(data);
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError('Failed to load campaign. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaign();
  }, [campaignId, isSignedIn, router]);

  // Handle private key verification for private campaigns
  const handlePrivateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!privateKey.trim()) {
      setPrivateKeyError('Private key is required');
      return;
    }
    
    setPrivateKeyError(null);
    
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/verify-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ privateKey }),
      });
      
      if (!response.ok) {
        throw new Error('Invalid private key');
      }
      
      // If key is valid, proceed to voting interface
      // This would typically update state to show the voting interface
    } catch (err) {
      console.error('Error verifying private key:', err);
      setPrivateKeyError('Invalid private key. Please try again.');
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
        <div className="alert alert-error max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // If campaign requires a private key and user hasn't provided one yet
  if (campaign && !campaign.isPublic && !privateKeyError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-xl font-bold">{campaign.name}</h1>
            <p className="mt-2">This is a private campaign. Please enter the private key to continue.</p>
            
            <form onSubmit={handlePrivateKeySubmit} className="mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Private Key</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${privateKeyError ? 'input-error' : ''}`}
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter private key"
                />
                {privateKeyError && (
                  <label className="label">
                    <span className="label-text-alt text-error">{privateKeyError}</span>
                  </label>
                )}
              </div>
              
              <button type="submit" className="btn btn-primary w-full mt-4">
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Render the voting interface
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Voting interface would go here */}
      <h1 className="text-2xl font-bold mb-4">{campaign?.name}</h1>
      <p>Voting interface for campaign: {campaignId}</p>
      
      {/* This would be replaced with your actual voting interface */}
    </div>
  );
};

export default VotePage;
