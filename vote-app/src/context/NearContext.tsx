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
  signIn: (redirectUrl?: string) => void;
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
        
        // If user is signed in with NEAR and has a valid session, redirect appropriately
        if (connected && user) {
          const returnUrl = localStorage.getItem('returnUrl');
          if (returnUrl) {
            localStorage.removeItem('returnUrl');
            router.push(returnUrl);
          } else {
            // Handle standard redirects without using wallet-callback
            const currentPath = window.location.pathname;
            if (currentPath === '/login' || currentPath === '/' || currentPath === '/wallet-callback') {
              if (user.userType === 'voter') {
                router.push('/voter');
              } else if (user.userType === 'campaign') {
                router.push('/campaign');
              } else if (user.userType === 'admin') {
                router.push('/admin');
              }
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

  const signIn = (redirectUrl?: string) => {
    if (!wallet) {
      console.error('NEAR wallet not initialized');
      return;
    }
    
    // Store the redirect URL if provided, otherwise use a default based on user type
    if (redirectUrl) {
      localStorage.setItem('returnUrl', redirectUrl);
    } else if (user) {
      const defaultUrl = user.userType === 'voter' 
        ? '/voter'
        : user.userType === 'campaign'
        ? '/campaign'
        : '/';
      localStorage.setItem('returnUrl', defaultUrl);
    }

    // Only use the wallet-callback for blockchain operations
    // For regular app usage, use direct URLs
    const successUrl = `${window.location.origin}${user ? 
      (user.userType === 'voter' ? '/voter' : 
       user.userType === 'campaign' ? '/campaign' : 
       '/') : '/login'}`;
    
    const failureUrl = `${window.location.origin}/login`;

    // Redirects to NEAR wallet to request full access
    wallet.requestSignIn({
      contractId: process.env.NEXT_PUBLIC_NEAR_CONTRACT_NAME,
      methodNames: ['create_campaign', 'cast_vote', 'get_campaign_results'],
      successUrl,
      failureUrl,
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