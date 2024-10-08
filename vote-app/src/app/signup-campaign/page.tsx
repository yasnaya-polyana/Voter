'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const SignUpCampaignPage: React.FC = () => {
  const [formData, setFormData] = useState({
    campaignName: '',
    organizerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    description: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    // Here you would typically send the data to your backend
    try {
      // Simulating an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Campaign created:', formData);
      router.push('/campaign-dashboard');
    } catch (err) {
      setError('Failed to create campaign. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Create a Campaign</h1>
      {error && <p className="text-error mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="campaignName"
          placeholder="Campaign Name"
          className="input input-bordered w-full"
          value={formData.campaignName}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="organizerName"
          placeholder="Organizer Name"
          className="input input-bordered w-full"
          value={formData.organizerName}
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
        <textarea
          name="description"
          placeholder="Campaign Description"
          className="textarea textarea-bordered w-full"
          value={formData.description}
          onChange={handleInputChange}
          required
        ></textarea>
        <button type="submit" className="btn btn-primary w-full">Create Campaign</button>
      </form>
    </div>
  );
};

export default SignUpCampaignPage;
