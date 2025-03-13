'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useNear } from '@/context/NearContext';

interface CampaignKeys {
  campaignName: string;
  isPublic: boolean;
  publicKey: string;
  privateKey?: string;
  blockchainId?: string;
  blockchainTxHash?: string;
  description?: string;
  startDate: string;
  endDate: string;
  adminKey: string;
}

const CampaignKeysPage = () => {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const [keys, setKeys] = useState<CampaignKeys | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const [verifying, setVerifying] = useState(false);
  const [blockchainStatus, setBlockchainStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [blockchainMessage, setBlockchainMessage] = useState('');
  const [explorerUrl, setExplorerUrl] = useState('');
  const { wallet, isSignedIn } = useNear();
  const [origin, setOrigin] = useState('');

  // Set origin safely after component mounts to avoid hydration mismatch
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    // Add global error handler
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setError(`An unexpected error occurred: ${event.error?.message || 'Unknown error'}`);
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        console.log('Fetching keys for token:', params.token);
        const response = await fetch(`/api/campaigns/keys/${params.token}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`Invalid or expired key token: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Keys data received:', {
          campaignName: data.campaignName,
          isPublic: data.isPublic,
          hasPublicKey: !!data.publicKey,
          hasPrivateKey: !!data.privateKey,
          blockchainId: data.blockchainId,
          blockchainTxHash: data.blockchainTxHash
        });
        
        setKeys(data);
        
        // Check blockchain status
        if (data.blockchainTxHash) {
          setBlockchainStatus('success');
          setBlockchainMessage('Campaign is on the blockchain');
          setExplorerUrl(`${process.env.NEXT_PUBLIC_NEAR_EXPLORER_URL || 'https://explorer.testnet.near.org'}/transactions/${data.blockchainTxHash}`);
        } else if (data.blockchainId) {
          setBlockchainStatus('pending');
          setBlockchainMessage('Creating campaign on blockchain...');
          // Start blockchain creation in the background
          createCampaignFromServer();
        }
      } catch (err) {
        console.error('Error in fetchKeys:', err);
        setError(`Failed to load campaign keys: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchKeys();
  }, [params.token]);

  // Poll for blockchain status updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (blockchainStatus === 'pending' && keys?.blockchainId) {
      interval = setInterval(async () => {
        try {
          // Check if campaign exists on blockchain
          const response = await fetch('/api/campaigns/blockchain/check', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              campaignId: keys.blockchainId
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.exists) {
              // Refresh keys to get the transaction hash
              const keysResponse = await fetch(`/api/campaigns/keys/${params.token}`);
              if (keysResponse.ok) {
                const updatedKeys = await keysResponse.json();
                setKeys(updatedKeys);
                
                if (updatedKeys.blockchainTxHash) {
                  setBlockchainStatus('success');
                  setBlockchainMessage('Campaign successfully created on blockchain!');
                  setExplorerUrl(`${process.env.NEXT_PUBLIC_NEAR_EXPLORER_URL || 'https://explorer.testnet.near.org'}/transactions/${updatedKeys.blockchainTxHash}`);
                  clearInterval(interval);
                }
              }
            }
          }
        } catch (err) {
          console.error('Error checking blockchain status:', err);
        }
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [blockchainStatus, keys, params.token]);

  const handleCopy = (key: string) => {
    if (!keys) return;
    
    // Use the browser's clipboard API
    let textToCopy = '';
    
    if (key === 'public') {
      textToCopy = keys.publicKey;
    } else if (key === 'private' && keys.privateKey) {
      textToCopy = keys.privateKey;
    } else if (key === 'link') {
      textToCopy = `${origin}/voter/${keys.publicKey}`;
    }
    
    if (!textToCopy) return;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied({ ...copied, [key]: true });
        setTimeout(() => {
          setCopied({ ...copied, [key]: false });
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const createCampaignFromServer = async () => {
    if (!keys?.blockchainId) {
      setError('No blockchain ID available');
      return;
    }
    
    setVerifying(true);
    setBlockchainStatus('pending');
    setBlockchainMessage('Creating campaign on blockchain...');
    
    try {
      // First get the campaign details
      const campaignResponse = await fetch(`/api/campaigns/${params.token}`);
      if (!campaignResponse.ok) {
        throw new Error('Failed to fetch campaign details');
      }
      
      const campaignData = await campaignResponse.json();
      
      // Generate a description if not available
      const description = campaignData.description || 
        `Voting campaign for ${campaignData.campaignName} (ID: ${keys.blockchainId})`;
      
      // Create the campaign on the blockchain from the server
      const response = await fetch('/api/campaigns/blockchain/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: keys.blockchainId,
          name: campaignData.campaignName,
          description: description,
          candidates: campaignData.candidates.map((c: any) => ({
            name: c.name,
            description: c.description || ''
          })),
          startDate: campaignData.startDate,
          endDate: campaignData.endDate,
          isPublic: campaignData.isPublic
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create campaign on blockchain');
      }
      
      const data = await response.json();
      console.log('Blockchain creation response:', data);
      
      if (data.success) {
        // Update the campaign with the transaction hash
        const updateResponse = await fetch(`/api/campaigns/${params.token}/update`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            blockchainTxHash: data.transactionHash,
            status: 'active'
          }),
        });
        
        if (updateResponse.ok) {
          setBlockchainStatus('success');
          setBlockchainMessage('Campaign successfully created on blockchain!');
          setExplorerUrl(`${process.env.NEXT_PUBLIC_NEAR_EXPLORER_URL || 'https://explorer.testnet.near.org'}/transactions/${data.transactionHash}`);
          
          // Refresh the keys
          const keysResponse = await fetch(`/api/campaigns/keys/${params.token}`);
          if (keysResponse.ok) {
            const updatedKeys = await keysResponse.json();
            setKeys(updatedKeys);
          }
        }
      } else {
        setBlockchainStatus('error');
        setBlockchainMessage(`Failed to create campaign on blockchain: ${data.error}`);
      }
    } catch (err) {
      console.error('Server-side blockchain creation error:', err);
      setBlockchainStatus('error');
      setBlockchainMessage(`Failed to create campaign on blockchain: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Loading campaign keys...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="alert alert-error max-w-md">
            <span>{error}</span>
          </div>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => router.push('/dashboard')}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!keys) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="alert alert-warning max-w-md">
            <span>No campaign keys found.</span>
          </div>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => router.push('/dashboard')}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">{keys.campaignName}</h1>
      <p className="text-gray-600 mb-6">Campaign Keys and Access Information</p>
      
      {/* Blockchain Status Card */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">
            Blockchain Status
            {blockchainStatus === 'pending' && (
              <div className="loading loading-spinner loading-sm"></div>
            )}
          </h2>
          
          <div className={`alert ${
            blockchainStatus === 'success' ? 'alert-success' : 
            blockchainStatus === 'error' ? 'alert-error' : 
            'alert-info'
          }`}>
            <span>{blockchainMessage}</span>
          </div>
          
          {explorerUrl && (
            <div className="card-actions justify-end mt-2">
              <a 
                href={explorerUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline"
              >
                View on NEAR Explorer
              </a>
            </div>
          )}
          
          {blockchainStatus === 'error' && (
            <div className="card-actions justify-end mt-2">
              <button 
                onClick={createCampaignFromServer}
                className="btn btn-sm btn-outline"
                disabled={verifying}
              >
                {verifying ? (
                  <div className="flex items-center">
                    <div className="loading loading-spinner loading-xs mr-1"></div> 
                    <span>Retrying...</span>
                  </div>
                ) : (
                  <span>Retry</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Public Key Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Public Key</h2>
            <p className="text-sm mb-4">Share this key with voters so they can access the campaign.</p>
            
            <div className="bg-base-200 p-4 rounded-lg mb-4 overflow-x-auto">
              <code className="break-all">{keys.publicKey}</code>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                className="btn btn-primary flex-1"
                onClick={() => handleCopy('public')}
              >
                {copied.public ? 'Copied!' : 'Copy Public Key'}
              </button>
              
              {origin && (
                <a 
                  href={`/voter/${keys.publicKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline flex-1"
                >
                  View Campaign
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Campaign Link Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Campaign Link</h2>
            <p className="text-sm mb-4">Share this link with voters to access the campaign.</p>
            
            <div className="bg-base-200 p-4 rounded-lg mb-4 overflow-x-auto">
              <code className="break-all">
                {origin ? `${origin}/voter/${keys.publicKey}` : 'Loading link...'}
              </code>
            </div>
            
            <button 
              className="btn btn-primary w-full"
              onClick={() => handleCopy('link')}
              disabled={!origin}
            >
              {copied.link ? 'Copied!' : 'Copy Campaign Link'}
            </button>
          </div>
        </div>
        
        {/* Private Key Card (if applicable) */}
        {!keys.isPublic && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Private Key</h2>
              <p className="text-sm mb-4">This key is required for voters to cast their votes. Share it only with authorized voters.</p>
              
              <div className="bg-base-200 p-4 rounded-lg mb-4 overflow-x-auto">
                <code className="break-all">{keys.privateKey}</code>
              </div>
              
              <button 
                className="btn btn-primary w-full"
                onClick={() => handleCopy('private')}
              >
                {copied.private ? 'Copied!' : 'Copy Private Key'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions Card */}
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <h2 className="card-title">Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2 mt-2">
            <li>Share the Public Key with voters so they can access the campaign.</li>
            {!keys.isPublic && (
              <li>Share the Private Key with authorized voters so they can cast their votes.</li>
            )}
            <li>
              Voters can access the campaign at: {origin ? (
                <a 
                  href={`/voter/${keys.publicKey}`} 
                  className="text-blue-500 hover:underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {`${origin}/voter/${keys.publicKey}`}
                </a>
              ) : 'Loading link...'}
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default CampaignKeysPage; 