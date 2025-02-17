'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

const SignUpCampaignPage: React.FC = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/signup/campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userType: 'campaign',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      console.log('Campaign account created:', data.user);
      
      // Call login function with email and password
      const loginResult = await login(formData.email, formData.password);
      
      if (loginResult.success) {
        router.push('/campaign');
      } else {
        throw new Error(loginResult.error || 'Failed to log in after signup');
      }
    } catch (error) {
      setError(error.message || 'Failed to create account. Please try again.');
      console.error('Error creating account:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Sign Up as Campaign Organizer</h1>
      {error && <p className="text-error mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="organizationName"
          placeholder="Organization Name"
          className="input input-bordered w-full"
          value={formData.organizationName}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="contactPerson"
          placeholder="Contact Person"
          className="input input-bordered w-full"
          value={formData.contactPerson}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="input input-bordered w-full"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="input input-bordered w-full"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
        />
        <button type="submit" className="btn btn-primary w-full">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpCampaignPage;
