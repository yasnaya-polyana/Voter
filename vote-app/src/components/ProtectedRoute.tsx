'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedUserTypes = [], 
  redirectTo = '/dashboard' 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // If user is logged in and trying to access auth pages, redirect to dashboard
        if (window.location.pathname === '/' || 
            window.location.pathname.startsWith('/signup')) {
          router.push(redirectTo);
        }
      } else if (allowedUserTypes.length > 0) {
        // If route requires authentication and user is not logged in
        router.push('/');
      }
    }
  }, [user, loading, router, redirectTo, allowedUserTypes]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
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

  // If no user types are specified, or if user type matches allowed types
  if (allowedUserTypes.length === 0 || 
      (user && allowedUserTypes.includes(user.userType))) {
    return <>{children}</>;
  }

  // If user doesn't have permission, redirect to home
  router.push('/');
  return null;
};

export default ProtectedRoute;
