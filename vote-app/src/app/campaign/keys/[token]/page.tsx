'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useNear } from '@/context/NearContext';
import Link from 'next/link';
import { getContract } from '@/lib/near-contract';

interface CampaignKeys {
  campaignName: string;
  isPublic: boolean;
  publicKey: string;
  privateKey?: string;
  blockchainId?: string;
  blockchainTxHash?: string;
  description?: string;
}

const SecureKeyPage = ({ params }: { params: { token: string } }) => {
  const router = useRouter();
  const [keys, setKeys] = useState<CampaignKeys | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<{ [key: string]: boolean }>({});
  const [blockchainVerified, setBlockchainVerified] = useState<boolean | null>(null);
  const [blockchainDetails, setBlockchainDetails] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const { wallet, isSignedIn } = useNear();

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
        
        // If blockchain ID exists, wait a bit longer before verifying
        // This gives time for the blockchain transaction to be confirmed
        if (data.blockchainId) {
          console.log('Blockchain ID found, will verify in 5 seconds');
          setTimeout(() => {
            verifyBlockchainCampaign();
          }, 5000); // Wait 5 seconds
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

  const handleCopy = (type: string) => {
    setCopySuccess({ ...copySuccess, [type]: true });
    setTimeout(() => {
      setCopySuccess({ ...copySuccess, [type]: false });
    }, 2000);
  };

  const verifyBlockchainCampaign = async () => {
    if (!keys) {
      console.error('No keys available, cannot verify blockchain campaign');
      setError('Campaign keys not loaded');
      return;
    }

    if (!keys.blockchainId) {
      console.error('No blockchain ID available for this campaign', keys);
      setError('No blockchain ID available for this campaign');
      return;
    }

    setVerifying(true);
    try {
      console.log('Verifying blockchain campaign with ID:', keys.blockchainId);
      
      // Fetch campaign details from blockchain
      const response = await fetch(`/api/campaigns/blockchain/${keys.blockchainId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Blockchain verification API error:', response.status, errorText);
        throw new Error(`Failed to verify campaign on blockchain: ${response.status}, ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Blockchain verification result:', data);
      
      setBlockchainDetails(data);
      setBlockchainVerified(true);
      
      // If we don't have a transaction hash but the campaign exists on blockchain,
      // we should update our database with this information
      if (!keys.blockchainTxHash && data) {
        console.log('Campaign exists on blockchain but has no transaction hash. Updating status...');
        try {
          const updateResponse = await fetch(`/api/campaigns/${params.token}/update`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'active',
              blockchainVerified: true
            }),
          });
          
          if (updateResponse.ok) {
            console.log('Campaign status updated successfully');
            // Refresh the keys data
            const keysResponse = await fetch(`/api/campaigns/keys/${params.token}`);
            if (keysResponse.ok) {
              const updatedKeys = await keysResponse.json();
              setKeys(updatedKeys);
            }
          }
        } catch (updateError) {
          console.error('Error updating campaign status:', updateError);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Blockchain verification error:', err);
      setBlockchainVerified(false);
      setError(`Blockchain verification failed: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const checkBlockchainDirectly = async () => {
    if (!keys?.blockchainId) {
      setError('No blockchain ID available');
      return;
    }
    
    setVerifying(true);
    try {
      const response = await fetch('/api/campaigns/blockchain/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: keys.blockchainId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Direct blockchain check result:', data);
      
      if (data.exists) {
        setBlockchainDetails(data.details);
        setBlockchainVerified(true);
        setError(null);
      } else {
        setBlockchainVerified(false);
        setError('Campaign not found on blockchain');
      }
    } catch (err) {
      console.error('Direct blockchain check error:', err);
      setBlockchainVerified(false);
      setError(`Blockchain check failed: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const retryFetchKeys = () => {
    setLoading(true);
    setError(null);
    
    const fetchKeys = async () => {
      try {
        console.log('Retrying fetch keys for token:', params.token);
        const response = await fetch(`/api/campaigns/keys/${params.token}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`Invalid or expired key token: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Keys data received on retry:', data);
        
        setKeys(data);
      } catch (err) {
        console.error('Error in retry fetchKeys:', err);
        setError(`Failed to load campaign keys: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchKeys();
  };

  const createCampaignFromServer = async () => {
    if (!keys?.blockchainId) {
      setError('No blockchain ID available');
      return;
    }
    
    setVerifying(true);
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
          candidates: campaignData.candidates.map(c => ({ 
            id: c.id, 
            name: c.name 
          }))
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
      
      const data = await response.json();
      console.log('Server-side blockchain creation result:', data);
      
      if (data.success && data.transactionHash) {
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
          // Refresh the keys
          const keysResponse = await fetch(`/api/campaigns/keys/${params.token}`);
          if (keysResponse.ok) {
            const updatedKeys = await keysResponse.json();
            setKeys(updatedKeys);
          }
          
          // Verify the campaign
          setTimeout(() => {
            verifyBlockchainCampaign();
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Server-side blockchain creation error:', err);
      setError(`Failed to create campaign on blockchain: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const createSimpleCampaignFromServer = async () => {
    if (!keys?.blockchainId) {
      setError('No blockchain ID available');
      return;
    }
    
    setVerifying(true);
    try {
      // First get the campaign details
      const campaignResponse = await fetch(`/api/campaigns/${params.token}`);
      if (!campaignResponse.ok) {
        throw new Error('Failed to fetch campaign details');
      }
      
      const campaignData = await campaignResponse.json();
      
      // Create a simple campaign on the blockchain
      const response = await fetch('/api/campaigns/blockchain/simple-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: keys.blockchainId,
          name: campaignData.campaignName
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
      
      const data = await response.json();
      console.log('Simple campaign creation result:', data);
      
      if (data.success && data.transactionHash) {
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
          // Refresh the keys
          const keysResponse = await fetch(`/api/campaigns/keys/${params.token}`);
          if (keysResponse.ok) {
            const updatedKeys = await keysResponse.json();
            setKeys(updatedKeys);
          }
          
          // Verify the campaign
          setTimeout(() => {
            verifyBlockchainCampaign();
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Simple campaign creation error:', err);
      setError(`Failed to create simple campaign: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const createCampaignWithRpc = async () => {
    if (!keys?.blockchainId) {
      setError('No blockchain ID available');
      return;
    }
    
    setVerifying(true);
    try {
      // First get the campaign details
      const campaignResponse = await fetch(`/api/campaigns/${params.token}`);
      if (!campaignResponse.ok) {
        throw new Error('Failed to fetch campaign details');
      }
      
      const campaignData = await campaignResponse.json();
      
      // Create the campaign using RPC
      const response = await fetch('/api/campaigns/blockchain/rpc-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: keys.blockchainId,
          name: campaignData.campaignName,
          description: campaignData.description || `Campaign for ${campaignData.campaignName}`
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
      
      const data = await response.json();
      console.log('RPC campaign creation result:', data);
      
      if (data.success && data.transaction) {
        // Update the campaign with the transaction hash
        const txHash = data.transaction.transaction?.hash || 
                      data.transaction.transaction_outcome?.id;
        
        if (txHash) {
          const updateResponse = await fetch(`/api/campaigns/${params.token}/update`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              blockchainTxHash: txHash,
              status: 'active'
            }),
          });
          
          if (updateResponse.ok) {
            // Refresh the keys
            const keysResponse = await fetch(`/api/campaigns/keys/${params.token}`);
            if (keysResponse.ok) {
              const updatedKeys = await keysResponse.json();
              setKeys(updatedKeys);
            }
            
            // Verify the campaign
            setTimeout(() => {
              verifyBlockchainCampaign();
            }, 2000);
          }
        }
      }
    } catch (err) {
      console.error('RPC campaign creation error:', err);
      setError(`Failed to create campaign with RPC: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error || !keys) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Error</h3>
            <div className="text-sm">{error || 'Failed to load campaign keys'}</div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
            <button 
              onClick={retryFetchKeys}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Retry Loading Keys
            </button>
          </div>
        </div>
        
        {/* Debug information */}
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-bold">Debug Information</h3>
          <p>Token: {params.token}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Keys: {keys ? 'Loaded' : 'Not loaded'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">
            {keys.isPublic ? 'Campaign Public Key' : 'Campaign Access Keys'}
          </h2>

          <div className="alert alert-warning mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              {keys.isPublic 
                ? "Save this public key securely."
                : "Save both keys securely. The private key will not be shown again."}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <label className="label">
                <span className="label-text font-bold">Campaign Name</span>
              </label>
              <div className="bg-base-200 p-4 rounded-lg">
                {keys.campaignName}
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-bold">Public Key (8 digits)</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="bg-base-200 p-4 rounded-lg font-mono text-lg flex-grow">
                  {keys.publicKey}
                </div>
                <CopyToClipboard text={keys.publicKey} onCopy={() => handleCopy('public')}>
                  <button className="btn btn-square btn-outline">
                    {copySuccess['public'] ? '✓' : 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    }
                  </button>
                </CopyToClipboard>
              </div>
            </div>

            {!keys.isPublic && keys.privateKey && (
              <div>
                <label className="label">
                  <span className="label-text font-bold">Private Key (SHA-256)</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="bg-base-200 p-4 rounded-lg font-mono text-sm break-all flex-grow">
                    {keys.privateKey}
                  </div>
                  <CopyToClipboard text={keys.privateKey} onCopy={() => handleCopy('private')}>
                    <button className="btn btn-square btn-outline">
                      {copySuccess['private'] ? '✓' : 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      }
                    </button>
                  </CopyToClipboard>
                </div>
              </div>
            )}

            {keys.blockchainId && (
              <div>
                <label className="label">
                  <span className="label-text font-bold">Blockchain Campaign ID</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="bg-base-200 p-4 rounded-lg font-mono flex-grow">
                    {keys.blockchainId}
                  </div>
                  <CopyToClipboard text={keys.blockchainId} onCopy={() => handleCopy('blockchain')}>
                    <button className="btn btn-square btn-outline">
                      {copySuccess['blockchain'] ? '✓' : 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      }
                    </button>
                  </CopyToClipboard>
                </div>
              </div>
            )}
          </div>

          <div className="alert alert-info mt-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>
              {keys.isPublic 
                ? "Share this public key with voters to allow them to participate."
                : "Share both keys only with authorized voters. They will need both to participate."}
            </span>
          </div>

          <div className="mt-4 border-t pt-4">
            <h2 className="text-xl font-semibold mb-4">Blockchain Verification</h2>
            
            {!isSignedIn ? (
              <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <div>
                  <h3 className="font-bold">Sign in required</h3>
                  <p className="text-sm">Please sign in with your NEAR wallet to verify your campaign on the blockchain.</p>
                </div>
              </div>
            ) : keys?.blockchainId ? (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Blockchain Verification</h3>
                
                {!verifying ? (
                  <div className="p-4 border rounded-lg bg-green-50">
                    <p className="text-green-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Campaign verified on blockchain
                    </p>
                    {keys?.blockchainTxHash && (
                      <a 
                        href={`https://explorer.testnet.near.org/transactions/${keys.blockchainTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <span>View Transaction on NEAR Explorer</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span>Verifying on blockchain...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 border rounded-lg bg-yellow-50">
                <p className="text-amber-700">
                  This campaign doesn't have a blockchain ID. It may not have been created on the blockchain yet.
                </p>
                <button 
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => router.push(`/campaign/edit/${params.token}`)}
                >
                  Edit Campaign
                </button>
              </div>
            )}
          </div>

          {/* Manual verification buttons */}
          {keys && (
            <div className="mt-4 flex space-x-2">
              <button
                onClick={verifyBlockchainCampaign}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={verifying}
              >
                Verify on Blockchain
              </button>
              <button
                onClick={checkBlockchainDirectly}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={verifying}
              >
                Direct Blockchain Check
              </button>
            </div>
          )}

          {!keys?.blockchainTxHash && keys?.blockchainId && (
            <div className="mt-4 space-y-2">
              <button
                onClick={createCampaignFromServer}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                disabled={verifying}
              >
                Create on Blockchain (Server)
              </button>
              
              <button
                onClick={createSimpleCampaignFromServer}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={verifying}
              >
                Create Simple Campaign (Debug)
              </button>
              
              <button
                onClick={createCampaignWithRpc}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={verifying}
              >
                Create with RPC (Advanced)
              </button>
              
              <p className="text-sm text-gray-600">
                Use these if client-side blockchain creation failed
              </p>
            </div>
          )}

          <button 
            onClick={() => router.push('/campaign/active')}
            className="btn btn-primary w-full mt-6"
          >
            I Have Saved The {keys.isPublic ? 'Key' : 'Keys'}
          </button>
        </div>
      </div>

      {/* Debug section */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-8 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="font-bold mb-2">Debug Information</h3>
          <div className="text-xs font-mono whitespace-pre-wrap">
            <p>Token: {params.token}</p>
            <p>Keys Loaded: {keys ? 'Yes' : 'No'}</p>
            <p>Loading State: {loading ? 'Loading' : 'Done'}</p>
            <p>Error: {error || 'None'}</p>
            <p>Blockchain ID: {keys?.blockchainId || 'None'}</p>
            <p>Blockchain TX Hash: {keys?.blockchainTxHash || 'None'}</p>
            <p>Blockchain Verified: {blockchainVerified ? 'Yes' : blockchainVerified === false ? 'No' : 'Not checked'}</p>
            <p>Blockchain Details: {blockchainDetails ? JSON.stringify(blockchainDetails, null, 2) : 'None'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecureKeyPage; 