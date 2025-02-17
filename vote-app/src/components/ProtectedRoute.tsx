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
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
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
