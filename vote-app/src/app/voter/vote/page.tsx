// 8693DD7F
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useNear } from '@/context/NearContext';
import VoteInterface from '@/components/VoteInterface';
import Link from 'next/link';

const VotePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, wallet, signIn } = useNear();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState('');
  const [privateKeyError, setPrivateKeyError] = useState<string | null>(null);
  const [privateKeySubmitted, setPrivateKeySubmitted] = useState(false);
  
  // Get campaign ID from query parameters
  const campaignId = searchParams.get('campaignId');
  const isPrivate = searchParams.get('isPrivate') === 'true';

  useEffect(() => {
    // If no campaign ID, redirect to voter dashboard
    if (!campaignId) {
      router.push('/voter');
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
        
        // If the campaign is marked as private from the URL parameter,
        // we know the user came from the public key entry page
        if (isPrivate && !data.isPublic) {
          setPrivateKeyError(null);
          setPrivateKeySubmitted(false);
        }
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError('Failed to load campaign. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaign();
  }, [campaignId, router, isPrivate]);

  const handlePrivateKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!privateKey.trim()) {
      setPrivateKeyError('Please enter the private key');
      return;
    }
    
    // Since we no longer have the private key in the campaign object,
    // we need to verify it through an API call
    verifyPrivateKey();
  };

  const verifyPrivateKey = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns/${campaignId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ privateKey }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setPrivateKeyError(data.error || 'Failed to verify private key');
        setLoading(false);
        return;
      }
      
      if (!data.valid) {
        setPrivateKeyError('Invalid private key');
        setLoading(false);
        return;
      }
      
      setPrivateKeyError(null);
      setPrivateKeySubmitted(true);
      setLoading(false);
    } catch (error) {
      console.error('Error verifying private key:', error);
      setPrivateKeyError('An error occurred while verifying the private key');
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (campaignId) {
      localStorage.setItem('returnUrl', `/voter/vote?campaignId=${campaignId}`);
    }
    signIn();
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

  // If campaign is private and private key hasn't been submitted
  if (campaign && !campaign.isPublic && !privateKeySubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-2xl font-bold mb-6">Private Campaign</h1>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Enter Private Key</h2>
            <p className="mb-4">This campaign "{campaign.name || campaign.campaignName}" requires a private key to access. Please enter the private key provided by the campaign organizer.</p>
            
            <form onSubmit={handlePrivateKeySubmit}>
              <div className="form-control">
                <input
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter private key"
                  className="input input-bordered w-full"
                  autoFocus
                />
                {privateKeyError && (
                  <p className="text-error text-sm mt-1">{privateKeyError}</p>
                )}
              </div>
              <div className="form-control mt-4">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-xs mr-2"></span>
                      Verifying...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-4 text-center">
              <Link href="/voter" className="link link-hover">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is not signed in, show campaign info and login button
  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{campaign.name || campaign.campaignName}</h1>
        
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Campaign Information</h2>
            <p>{campaign.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm opacity-70">Start Date:</p>
                <p>{new Date(campaign.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">End Date:</p>
                <p>{new Date(campaign.endDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <h3 className="font-semibold mt-6 mb-2">Candidates:</h3>
            <ul className="list-disc pl-5">
              {campaign.candidates && campaign.candidates.map((candidate: any) => (
                <li key={candidate.id || candidate._id}>
                  {candidate.name}
                  {candidate.description && <span className="opacity-70"> - {candidate.description}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title justify-center">Login to Vote</h2>
            <p className="mb-4">You need to login to cast your vote in this campaign.</p>
            <button onClick={handleLogin} className="btn btn-primary">
              Login with NEAR
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/voter" className="link link-hover">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // If everything is good, show the voting interface
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{campaign.name || campaign.campaignName}</h1>
      
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <VoteInterface
            campaignId={campaignId}
            candidates={campaign.candidates || []}
            isPrivate={!campaign.isPublic}
            privateKey={privateKey}
            publicKey={campaign.publicKey}
          />
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <Link href="/voter" className="link link-hover">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default VotePage;
