'use client';

//TEST KEYS
// 369cc45487b62011af671c5329cd3001c277034a37ed1ffa9886988dfe77825e PUBLIC
// 0d1b01056d95e4685b9541bf2b44c16706e21c7ffccdad9d0996a6d63c344245 PRIVATE

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import crypto from 'crypto';
import { CopyToClipboard } from 'react-copy-to-clipboard';

interface KeyGenerationProps {
  campaignId: string;
  isPublic: boolean;
}

const KeyGeneration: React.FC<KeyGenerationProps> = ({ campaignId, isPublic }) => {
  const router = useRouter();
  const [publicKey, setPublicKey] = useState<string>('');
  const [privateKey, setPrivateKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<{ public: boolean; private: boolean }>({
    public: false,
    private: false
  });

  useEffect(() => {
    const generateKeys = async () => {
      try {
        // Generate 8-digit public key
        const generatedPublicKey = Math.floor(10000000 + Math.random() * 90000000).toString();
        setPublicKey(generatedPublicKey);

        // Only generate private key for private campaigns
        if (!isPublic) {
          // Generate a cryptographically secure random string as input
          const randomInput = crypto.randomBytes(32).toString('hex');
          
          // Create SHA-256 hash from the random input
          const generatedPrivateKey = crypto.createHash('sha256')
            .update(randomInput)
            .digest('hex');
          
          setPrivateKey(generatedPrivateKey);
        }

        // Save keys to database
        await fetch(`/api/campaigns/${campaignId}/keys`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            publicKey: generatedPublicKey,
            privateKey: !isPublic ? generatedPrivateKey : undefined,
            isPublic
          })
        });

      } catch (err) {
        setError('Failed to generate keys');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    generateKeys();
  }, [campaignId, isPublic]);

  const handleCopy = (type: 'public' | 'private') => {
    setCopySuccess(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopySuccess(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4">Generating campaign key{!isPublic ? 's' : ''}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">
            {isPublic ? 'Campaign Public Key' : 'Campaign Access Keys'}
          </h2>
          
          <div className="space-y-4">
            {/* Public Key Display */}
            <div>
              <label className="label">
                <span className="label-text font-bold">Public Key (8 digits)</span>
              </label>
              <div className="flex items-center space-x-2">
                <div className="bg-base-200 p-4 rounded-lg font-mono text-lg flex-grow">
                  {publicKey}
                </div>
                <CopyToClipboard text={publicKey} onCopy={() => handleCopy('public')}>
                  <button className="btn btn-square btn-outline">
                    {copySuccess.public ? '✓' : 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    }
                  </button>
                </CopyToClipboard>
              </div>
            </div>

            {/* Private Key Display (only for private campaigns) */}
            {!isPublic && (
              <div>
                <label className="label">
                  <span className="label-text font-bold">Private Key (SHA-256)</span>
                </label>
                <div className="flex items-center space-x-2">
                  <div className="bg-base-200 p-4 rounded-lg font-mono text-sm break-all flex-grow">
                    {privateKey}
                  </div>
                  <CopyToClipboard text={privateKey} onCopy={() => handleCopy('private')}>
                    <button className="btn btn-square btn-outline">
                      {copySuccess.private ? '✓' : 
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

          <div className="alert alert-info mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>
              {isPublic 
                ? "Share this public key with voters to allow them to participate."
                : "Share both keys only with authorized voters. The private key will not be shown again."}
            </span>
          </div>

          <button 
            onClick={() => router.push('/campaign/active')}
            className="btn btn-primary w-full mt-4"
          >
            I Have Saved The {isPublic ? 'Key' : 'Keys'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyGeneration; 