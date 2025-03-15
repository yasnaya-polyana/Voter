'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useNear } from '@/context/NearContext';
import { useEffect, useState } from 'react';

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
                
                {!isSignedIn ? (
                  // Logged in but no wallet connected
                  <button onClick={signIn} className="btn btn-secondary">
                    Connect Wallet
                  </button>
                ) : (
                  // Wallet connected - show account
                  <span className="text-sm text-gray-600">
                    {accountId}
                  </span>
                )}

                <button 
                  onClick={handleLogout} 
                  className="btn btn-outline btn-error"
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
