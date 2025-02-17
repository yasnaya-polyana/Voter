'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CopyToClipboard } from 'react-copy-to-clipboard';

interface CampaignKeys {
  campaignName: string;
  isPublic: boolean;
  publicKey: string;
  privateKey?: string;
}

const SecureKeyPage = ({ params }: { params: { token: string } }) => {
  const router = useRouter();
  const [keys, setKeys] = useState<CampaignKeys | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetch(`/api/campaigns/keys/${params.token}`);
        if (!response.ok) throw new Error('Invalid or expired key token');
        const data = await response.json();
        
        // Validate that private campaigns have both keys
        if (!data.isPublic && !data.privateKey) {
          throw new Error('Private campaign is missing required keys');
        }
        
        setKeys(data);
      } catch (err) {
        setError('Failed to load campaign keys');
        console.error(err);
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
          <span>{error || 'Failed to load keys'}</span>
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

          <button 
            onClick={() => router.push('/campaign/active')}
            className="btn btn-primary w-full mt-6"
          >
            I Have Saved The {keys.isPublic ? 'Key' : 'Keys'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecureKeyPage; 