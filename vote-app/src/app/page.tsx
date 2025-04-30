'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();

  // Define buttons based on user auth state
  const renderAuthActions = () => {
    if (loading) {
      return (
        <div className="mt-8 space-y-4">
          <div className="h-12 w-48 bg-base-300 animate-pulse rounded-lg mx-auto"></div>
          <div className="flex justify-center space-x-4">
            <div className="h-10 w-32 bg-base-300 animate-pulse rounded-lg"></div>
            <div className="h-10 w-32 bg-base-300 animate-pulse rounded-lg"></div>
          </div>
        </div>
      );
    }
    if (user) {
      let dashboardLink = '/'; // Default fallback
      if (user.userType === 'voter') dashboardLink = '/voter';
      if (user.userType === 'campaign') dashboardLink = '/campaign';
      if (user.userType === 'admin') dashboardLink = '/admin';
      return (
        <div className="mt-8">
          <Link href={dashboardLink} className="btn btn-primary btn-lg">
            Go to Your Dashboard
          </Link>
        </div>
      );
    } else {
      return (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Voter Actions */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body items-center text-center">
              <h3 className="card-title text-base-content">Voter</h3>
              <p className="text-sm mb-4 text-base-content">Participate in secure voting campaigns.</p>
              <div className="card-actions justify-center w-full space-y-2 sm:space-y-0 sm:space-x-2">
                <Link href="/login?type=voter" className="btn btn-primary btn-block sm:btn-wide">
                  Login
                </Link>
                <Link href="/signup?type=voter" className="btn btn-outline btn-block sm:btn-wide">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>

          {/* Campaign Creator Actions */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body items-center text-center">
              <h3 className="card-title text-base-content">Campaign Creator</h3>
              <p className="text-sm mb-4 text-base-content">Create and manage your own voting campaigns.</p>
              <div className="card-actions justify-center w-full space-y-2 sm:space-y-0 sm:space-x-2">
                <Link href="/login?type=campaign" className="btn btn-secondary btn-block sm:btn-wide">
                  Login
                </Link>
                <Link href="/signup?type=campaign" className="btn btn-outline btn-secondary btn-block sm:btn-wide">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="hero min-h-[50vh] bg-gradient-to-br from-primary to-secondary text-primary-content rounded-box py-16">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            {/* Text Logo */}
            <h1 className="text-8xl font-extrabold mb-4 tracking-tight">
              Voter
            </h1>
            <p className="mb-8 text-xl font-light">
              The secure, transparent platform for decentralized voting powered by the NEAR blockchain.
            </p>
            <p className="text-lg">
              Ready to make your voice heard or launch your own campaign?
            </p>
            {/* Render Login/Signup or Dashboard button */}
            {renderAuthActions()}
          </div>
        </div>
      </div>

      {/* Features Section (Optional - Keep if relevant) */}
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Why Choose Voter?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="card-body items-center text-center">
              <h3 className="card-title">Blockchain Security</h3>
              <p className="text-base-content">Immutable and transparent vote records on the NEAR Protocol.</p>
            </div>
          </div>
          {/* Feature Card 2 */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="card-body items-center text-center">
              <h3 className="card-title">Effortless Management</h3>
              <p className="text-base-content">Intuitive tools for creating and overseeing voting campaigns.</p>
            </div>
          </div>
          {/* Feature Card 3 */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="card-body items-center text-center">
              <h3 className="card-title">Clear Verification</h3>
              <p className="text-base-content">Easily verify votes using blockchain transaction details.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section (Simplified CTA) */}
      <div className="container mx-auto px-4 text-center bg-base-200 py-12 rounded-box">
        <h2 className="text-3xl font-bold mb-6">Simple & Secure</h2>
        <p className="mb-8 text-lg max-w-2xl mx-auto text-base-content">
          Voter provides distinct interfaces for participating in votes and managing campaigns, ensuring a focused and secure experience for everyone.
        </p>
        {/* You might add links to documentation or specific guides here if needed */}
      </div>
    </div>
  );
}