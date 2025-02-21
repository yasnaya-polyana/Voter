'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(email, password);
      if (result.success && result.user) {
        // Redirect based on user type
        if (result.user.userType === 'voter') {
          router.push('/voter');
        } else if (result.user.userType === 'campaign') {
          router.push('/campaign');
        }
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Login to Vote App</h2>
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-control">
              <input
                type="email"
                placeholder="Email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <input
                type="password"
                placeholder="Password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
