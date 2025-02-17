'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  console.log('Current user:', user); // Debug log to see user data

  const renderButtons = () => {
    // Not logged in
    if (!user) {
      return (
        <div className="space-y-4">
          <Link href="/signup/voter" className="btn btn-primary w-full">Sign up to Vote</Link>
          <Link href="/signup/campaign" className="btn btn-secondary w-full">Sign up to Add Campaign</Link>
          <Link href="/information" className="btn btn-outline w-full">Learn More</Link>
        </div>
      );
    }

    // Logged in as voter
    if (user.userType === 'voter') {
      return (
        <div className="space-y-4">
          <Link href="/voter" className="btn btn-primary w-full">Voter Dashboard</Link>
          <Link href="/voter/history" className="btn btn-secondary w-full">Vote History</Link>
          <Link href="/information" className="btn btn-outline w-full">Learn More</Link>
        </div>
      );
    }

    // Logged in as campaign admin
    if (user.userType === 'admin') {
      return (
        <div className="space-y-4">
          <Link href="/campaign/manage" className="btn btn-primary w-full">Campaign Dashboard</Link>
          <Link href="/campaign/new" className="btn btn-secondary w-full">Create New Campaign</Link>
          <Link href="/information" className="btn btn-outline w-full">Learn More</Link>
        </div>
      );
    }

    // Fallback for unknown user type
    return (
      <div className="space-y-4">
        <Link href="/campaign" className="btn btn-primary w-full">Dashboard</Link>
        <Link href="/information" className="btn btn-outline w-full">Learn More</Link>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Welcome to Voter</h1>
            <p className="py-6">Your trusted platform for secure and transparent voting.</p>
            {renderButtons()}
          </div>
        </div>
      </div>
    </div>
  );
}