'use client';

import { useNear } from '@/context/NearContext';

export function WalletButton() {
  const { isSignedIn, signIn, signOut, accountId } = useNear();

  if (!isSignedIn) {
    return (
      <button
        onClick={signIn}
        className="btn btn-primary"
      >
        Connect NEAR Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{accountId}</span>
      <button
        onClick={signOut}
        className="btn btn-outline btn-sm"
      >
        Disconnect
      </button>
    </div>
  );
} 