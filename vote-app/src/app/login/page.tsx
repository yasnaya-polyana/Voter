'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(email, password);

      if (result.success) {
        // Use the updated user state
        const currentUser = result.user;
        if (currentUser?.userType === 'voter') {
          router.push('/voter');
        } else if (currentUser?.userType === 'campaign') {
          router.push('/campaign');
        } else {
          throw new Error('Invalid user type');
        }
      } else {
        setError(result.error || 'An error occurred during login');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Login to Voter App</h2>
          {error && <p className="text-error">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary w-full">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
