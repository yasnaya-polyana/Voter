'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initNear } from '@/lib/near-config';
import { nearConfig } from '@/lib/near-config';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

interface NearContextType {
  wallet: any;
  isSignedIn: boolean;
  accountId: string | null;
  signIn: () => void;
  signOut: () => void;
  loading: boolean;
}

const NearContext = createContext<NearContextType | null>(null);

export function NearProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const setupNear = async () => {
      setLoading(true);
      try {
        const { wallet, connected, accountId } = await initNear();
        setWallet(wallet);
        setIsSignedIn(connected);
        setAccountId(accountId);
        
        // If user is signed in with NEAR and has a valid session, redirect to appropriate page
        if (connected && user) {
          const currentPath = window.location.pathname;
          if (currentPath === '/login' || currentPath === '/') {
            if (user.userType === 'voter') {
              router.push('/voter');
            } else if (user.userType === 'campaign') {
              router.push('/campaign');
            }
          }
        }
      } catch (error) {
        console.error('Error setting up NEAR:', error);
      } finally {
        setLoading(false);
      }
    };

    setupNear();
  }, [user, router]);

  const signIn = () => {
    if (!wallet) return;
    setLoading(true);

    // Get the redirect URL based on user type
    const getSuccessUrl = () => {
      if (!user) return `${window.location.origin}/login`;
      return user.userType === 'voter' 
        ? `${window.location.origin}/voter`
        : `${window.location.origin}/campaign`;
    };

    // Redirects to NEAR wallet to request full access
    wallet.requestSignIn({
      contractId: process.env.NEXT_PUBLIC_NEAR_CONTRACT_NAME,
      methodNames: ['create_campaign', 'cast_vote', 'get_campaign_results'],
      successUrl: getSuccessUrl(),
      failureUrl: `${window.location.origin}/login`,
    });
  };

  const signOut = () => {
    if (!wallet) return;
    setLoading(true);
    wallet.signOut();
    setIsSignedIn(false);
    setAccountId(null);
    
    // Redirect based on user type
    if (user?.userType === 'voter') {
      router.push('/voter');
    } else if (user?.userType === 'campaign') {
      router.push('/campaign');
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <NearContext.Provider value={{ wallet, isSignedIn, accountId, signIn, signOut, loading }}>
      {children}
    </NearContext.Provider>
  );
}

export const useNear = () => {
  const context = useContext(NearContext);
  if (!context) throw new Error('useNear must be used within a NearProvider');
  return context;
}; 