'use client';

import { useNear } from '@/context/NearContext';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export function NearAuthGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, signIn } = useNear();
  const { user } = useAuth();
  const pathname = usePathname();

  // Public routes that don't require NEAR wallet
  const publicRoutes = ['/', '/login', '/signup', '/information'];
  const isPublicRoute = publicRoutes.includes(pathname);

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