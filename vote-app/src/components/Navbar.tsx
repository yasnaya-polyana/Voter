'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useNear } from '@/context/NearContext';
import { useEffect, useState } from 'react';

// Account type badge colors
const accountTypeColors = {
  voter: 'badge-primary',
  campaign: 'badge-secondary',
  admin: 'badge-accent'
};

// Account type display names
const accountTypeNames = {
  voter: 'Voter',
  campaign: 'Campaign',
  admin: 'Admin'
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isSignedIn, signIn, signOut, accountId } = useNear();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors by waiting for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return null on server-side and first render
  }

  const handleLogout = () => {
    if (isSignedIn) {
      signOut();
    }
    logout();
  };

  return (
    <nav className="bg-base-100 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            Voter
          </Link>

          <div className="flex items-center gap-4">
            {!user ? (
              // Not logged in - show public navigation
              <>
                <Link href="/information" className="btn btn-ghost">
                  About
                </Link>
                <Link href="/login" className="btn btn-primary">
                  Login
                </Link>
              </>
            ) : (
              // Logged in - show user navigation
              <>
                {/* User account type badge */}
                <div className="flex items-center gap-2 mr-2 px-3 py-1 rounded-lg bg-opacity-10 bg-base-300">
                  <span className="text-sm">Account:</span>
                  <div className={`badge ${accountTypeColors[user.userType] || 'badge-ghost'}`}>
                    {accountTypeNames[user.userType] || user.userType}
                  </div>
                </div>

                {user.userType === 'voter' && (
                  <Link href="/voter" className="btn btn-ghost">
                    Voter Dashboard
                  </Link>
                )}
                {user.userType === 'campaign' && (
                  <Link href="/campaign" className="btn btn-ghost">
                    Campaign Dashboard
                  </Link>
                )}
                {user.userType === 'admin' && (
                  <Link href="/admin" className="btn btn-ghost">
                    Admin Dashboard
                  </Link>
                )}
                
                <div className="divider divider-horizontal h-8 mx-0"></div>
                
                {!isSignedIn ? (
                  // Logged in but no wallet connected
                  <button onClick={signIn} className="btn btn-secondary btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1">
                      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                      <path d="M18 12v4H6a2 2 0 0 0-2 2c0 1.1.9 2 2 2h12v-4" />
                    </svg>
                    Connect Wallet
                  </button>
                ) : (
                  // Wallet connected - show account
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-opacity-10 bg-success bg-opacity-20">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm text-success font-medium">
                      {accountId && accountId.length > 15 
                        ? `${accountId.substring(0, 6)}...${accountId.substring(accountId.length - 4)}` 
                        : accountId}
                    </span>
                  </div>
                )}

                <button 
                  onClick={handleLogout} 
                  className="btn btn-outline btn-error btn-sm"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
