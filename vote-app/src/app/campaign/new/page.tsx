'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../../context/AuthContext';

const NewCampaignPage: React.FC = () => {
  const [formData, setFormData] = useState({
    campaignName: '',
    description: '',
    isPublic: true,
  });
  const [error, setError] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, isPublic: e.target.value === 'public' });
  };

  const generatePrivateKey = () => {
    return uuidv4().substr(0, 8).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const campaignId = `CAM${uuidv4().substr(0, 6).toUpperCase()}`;
      const newPrivateKey = formData.isPublic ? '' : generatePrivateKey();
      const campaignData = {
        ...formData,
        id: campaignId,
        createdBy: user?.id,
        privateKey: newPrivateKey,
      };

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      const result = await response.json();
      console.log('Campaign created:', result);

      if (!formData.isPublic) {
        setPrivateKey(newPrivateKey);
      }
      router.push('/campaign');
    } catch (error) {
      setError('Failed to create campaign. Please try again.');
      console.error('Error creating campaign:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Create a New Campaign</h1>
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
        <textarea
          name="description"
          placeholder="Campaign Description"
          className="textarea textarea-bordered w-full"
          value={formData.description}
          onChange={handleInputChange}
          required
        ></textarea>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="campaignType"
              value="public"
              checked={formData.isPublic}
              onChange={handleRadioChange}
              className="radio radio-primary"
            />
            <span className="ml-2">Public Campaign</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="campaignType"
              value="private"
              checked={!formData.isPublic}
              onChange={handleRadioChange}
              className="radio radio-primary"
            />
            <span className="ml-2">Private Campaign</span>
          </label>
        </div>
        <button type="submit" className="btn btn-primary w-full">Create Campaign</button>
      </form>
      {privateKey && (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <h2 className="text-xl font-bold mb-2">Private Campaign Key</h2>
          <p>Your private campaign key is: <strong>{privateKey}</strong></p>
          <p className="mt-2 text-sm text-gray-600">
            Please save this key. Voters will need it to access your private campaign.
          </p>
        </div>
      )}
    </div>
  );
};

export default NewCampaignPage;
