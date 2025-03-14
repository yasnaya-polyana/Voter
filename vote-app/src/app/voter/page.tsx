'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNear } from '@/context/NearContext';
import Link from 'next/link';

const VoterHomePage = () => {
  const router = useRouter();
  const { isSignedIn } = useNear();
  const [campaignCode, setCampaignCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (campaignCode.trim()) {
      router.push(`/voter/${campaignCode.trim()}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Voter Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Enter Campaign Code</h2>
            <p className="mb-4">Enter a campaign code to access a specific voting campaign.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={campaignCode}
                  onChange={(e) => setCampaignCode(e.target.value)}
                  placeholder="Enter campaign code" 
                  className="input input-bordered flex-1" 
                  required 
                />
                <button type="submit" className="btn btn-primary">
                  Go to Vote
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Your Voting History</h2>
            <p>View campaigns you've participated in and your voting history.</p>
            <div className="card-actions justify-end mt-4">
              <Link href="/voter/history" className="btn btn-primary">
                View History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterHomePage;
