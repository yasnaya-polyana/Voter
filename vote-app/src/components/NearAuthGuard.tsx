'use client';

import { useNear } from '@/context/NearContext';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function NearAuthGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, signIn, loading: nearLoading } = useNear();
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Public routes that don't require NEAR wallet
  const publicRoutes = ['/', '/login', '/signup', '/information'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Set transitioning state when navigating
    const handleStart = () => setIsTransitioning(true);
    const handleComplete = () => setIsTransitioning(false);

    router.events?.on('routeChangeStart', handleStart);
    router.events?.on('routeChangeComplete', handleComplete);
    router.events?.on('routeChangeError', handleComplete);

    return () => {
      router.events?.off('routeChangeStart', handleStart);
      router.events?.off('routeChangeComplete', handleComplete);
      router.events?.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // Show loading skeleton when authentication is in progress
  if (authLoading || nearLoading || isTransitioning) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Skeleton for navbar */}
          <div className="h-16 w-full bg-base-200 animate-pulse mb-8 rounded"></div>
          
          {/* Skeleton for page content */}
          <div className="space-y-6">
            <div className="h-10 w-3/4 bg-base-200 animate-pulse rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-base-200 animate-pulse rounded-box"></div>
              <div className="h-64 bg-base-200 animate-pulse rounded-box"></div>
            </div>
            <div className="h-40 bg-base-200 animate-pulse rounded-box"></div>
          </div>
        </div>
      </div>
    );
  }

  // Only require NEAR wallet if user is logged in and not on a public route
  if (user && !isPublicRoute && !isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Connect Your NEAR Wallet</h1>
        <p className="mb-4">Please connect your NEAR wallet to access this feature</p>
        <button onClick={signIn} className="btn btn-primary">
          Connect NEAR Wallet
        </button>
      </div>
    );
  }

  return <>{children}</>;
} 