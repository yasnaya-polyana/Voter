'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const VoterPage: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn || user?.userType !== 'voter') {
      router.push('/login');
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || user?.userType !== 'voter') {
    return null; // or a loading spinner
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Voter Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/voter/vote" className="btn btn-primary btn-lg">
          Vote
        </Link>
        <Link href="/voter/history" className="btn btn-secondary btn-lg">
          Voting History
        </Link>
        <Link href="/voter/results" className="btn btn-accent btn-lg">
          View Results
        </Link>
      </div>
      <p className="mt-8 text-lg">
        Welcome to your Voter Dashboard. Here you can participate in active campaigns,
        view your voting history, and check the results of past campaigns.
      </p>
    </div>
  );
};

export default VoterPage;
