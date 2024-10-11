import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This is a placeholder for your actual authentication check
const isAuthenticated = () => {
  // Implement your authentication logic here
  return false;
};

const withAuth = (WrappedComponent: React.ComponentType, requiredRole?: string) => {
  return (props: any) => {
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated()) {
        router.push('/login');
      }
      // Add role-based check here if requiredRole is provided
    }, []);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
