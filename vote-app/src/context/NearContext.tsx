'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initNear } from '../lib/near-config';

interface NearContextType {
  wallet: any;
  isSignedIn: boolean;
  accountId: string | null;
  signIn: () => void;
  signOut: () => void;
}

const NearContext = createContext<NearContextType | null>(null);

export function NearProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    initNear().then(({ wallet }) => {
      setWallet(wallet);
      setIsSignedIn(wallet.isSignedIn());
      setAccountId(wallet.getAccountId());
    });
  }, []);

  const signIn = () => {
    wallet?.requestSignIn({
      contractId: process.env.NEXT_PUBLIC_CONTRACT_NAME,
      methodNames: ['cast_vote'],
    });
  };

  const signOut = () => {
    wallet?.signOut();
    setIsSignedIn(false);
    setAccountId(null);
  };

  return (
    <NearContext.Provider value={{ wallet, isSignedIn, accountId, signIn, signOut }}>
      {children}
    </NearContext.Provider>
  );
}

export const useNear = () => {
  const context = useContext(NearContext);
  if (!context) throw new Error('useNear must be used within a NearProvider');
  return context;
}; 