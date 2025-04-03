'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNear } from '@/context/NearContext';

export default function WalletCallback() {
  const [message, setMessage] = useState('Finalizing wallet connection...');
  const router = useRouter();
  const { user } = useAuth();
  const { isSignedIn, loading: nearLoading } = useNear();

  useEffect(() => {
    // Only proceed when Near loading is complete
    if (nearLoading) return;

    // Get the stored redirect URL or determine where to go based on user type
    const returnUrl = localStorage.getItem('returnUrl');
    const redirectToDestination = () => {
      if (returnUrl) {
        localStorage.removeItem('returnUrl');
        router.push(returnUrl);
      } else if (user) {
        if (user.userType === 'voter') {
          router.push('/voter');
        } else if (user.userType === 'campaign') {
          router.push('/campaign');
        } else if (user.userType === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        router.push('/login');
      }
    };

    if (isSignedIn) {
      setMessage('Wallet connected successfully! Redirecting...');
      // Add a small delay for better UX
      setTimeout(redirectToDestination, 1000);
    } else {
      setMessage('Wallet connection was not completed. Redirecting...');
      setTimeout(redirectToDestination, 1500);
    }
  }, [isSignedIn, nearLoading, router, user]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <h2 className="card-title justify-center mb-4">NEAR Wallet Connection</h2>
          <div className="flex flex-col items-center space-y-4">
            {nearLoading ? (
              <div className="loading loading-spinner loading-lg"></div>
            ) : isSignedIn ? (
              <div className="text-success text-5xl">✓</div>
            ) : (
              <div className="text-error text-5xl">✕</div>
            )}
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}