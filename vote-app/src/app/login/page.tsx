'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNear } from '@/context/NearContext';
import Link from 'next/link';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { login, user, isLoggedIn } = useAuth();
  const { signIn, isSignedIn, loading: nearLoading } = useNear();
  const router = useRouter();

  // Check if user is already logged in and redirect
  useEffect(() => {
    if (isLoggedIn && user) {
      // If the user is logged in and connected to NEAR, redirect them
      if (isSignedIn || user.userType === 'admin') {
        redirectBasedOnUserType(user.userType);
      } else {
        // Show NEAR wallet connection modal
        setLoginSuccess(true);
      }
    }
  }, [isLoggedIn, isSignedIn, user]);

  const redirectBasedOnUserType = (userType: string) => {
    if (userType === 'voter') {
      router.push('/voter');
    } else if (userType === 'campaign') {
      router.push('/campaign');
    } else if (userType === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(email, password);
      if (result.success && result.user) {
        // Admins don't need NEAR wallet connection
        if (result.user.userType === 'admin' || isSignedIn) {
          redirectBasedOnUserType(result.user.userType);
        } else {
          // Set login success to trigger NEAR wallet modal
          setLoginSuccess(true);
        }
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Login error:', error);
    }
  };

  const handleConnectNear = () => {
    // Store the appropriate return URL based on user type
    if (user) {
      localStorage.setItem('returnUrl', 
        user.userType === 'voter' 
          ? '/voter' 
          : user.userType === 'campaign'
          ? '/campaign'
          : '/'
      );
    }
    signIn();
  };

  const handleSkipConnection = () => {
    if (user) {
      redirectBasedOnUserType(user.userType);
    } else {
      router.push('/');
    }
  };

  // Show NEAR wallet connection modal after successful login
  if (loginSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title justify-center">Connect NEAR Wallet</h2>
            <p className="py-4">
              {user?.userType === 'voter' 
                ? 'Connect your NEAR wallet to cast votes on the blockchain.'
                : user?.userType === 'campaign'
                ? 'Connect your NEAR wallet to create campaigns on the blockchain.'
                : 'Connect your NEAR wallet to use blockchain features.'}
            </p>
            <div className="card-actions flex-col">
              <button onClick={handleConnectNear} className="btn btn-primary w-full">
                Connect NEAR Wallet
              </button>
              <button onClick={handleSkipConnection} className="btn btn-outline w-full mt-2">
                Skip for Now
              </button>
              <p className="text-xs mt-4 text-gray-500">
                You can connect your wallet later from the dashboard or when casting votes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Login to Vote App</h2>
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-control">
              <input
                type="email"
                placeholder="Email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <input
                type="password"
                placeholder="Password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Login
            </button>
          </form>
          <div className="text-center mt-4">
            <p className="text-sm">Don't have an account?</p>
            <div className="flex gap-2 mt-2 justify-center">
              <Link href="/signup/voter" className="btn btn-outline btn-sm">
                Register as Voter
              </Link>
              <Link href="/signup/campaign" className="btn btn-outline btn-sm">
                Register as Campaign
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
