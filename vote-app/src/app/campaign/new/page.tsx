'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../../../context/AuthContext';
import CandidateForm from '../../../components/CandidateForm';

interface FormData {
  campaignName: string;
  description: string;
  isPublic: boolean;
  startDate: Date | null;
  endDate: Date | null;
}

const NewCampaignPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [stage, setStage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaignId, setCampaignId] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    campaignName: '',
    description: '',
    isPublic: true,
    startDate: null,
    endDate: null
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleStartNow = () => {
    setFormData(prev => ({
      ...prev,
      startDate: new Date()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // First, validate the form data
      if (!formData.campaignName || !formData.description || !formData.startDate || !formData.endDate) {
        throw new Error('Please fill in all required fields');
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdBy: user?.email || 'anonymous',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create campaign');
      }

      const data = await response.json();
      console.log('Campaign created:', data);

      if (data.success) {
        // Store the campaign ID and token from the response
        setCampaignId(data.campaign.id);
        setToken(data.campaign.token || '');
        setStage(2); // Move to candidate stage
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCandidatesSubmitted = () => {
    // After candidates are added, redirect to the keys page
    router.push(`/campaign/keys/${token}`);
  };

  const renderStage1 = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Campaign Name</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          value={formData.campaignName}
          onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          className="textarea textarea-bordered"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Campaign Type</span>
        </label>
        <div className="join w-full">
          <button
            type="button"
            className={`join-item btn flex-1 ${formData.isPublic ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFormData({ ...formData, isPublic: true })}
          >
            Public
          </button>
          <button
            type="button"
            className={`join-item btn flex-1 ${!formData.isPublic ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFormData({ ...formData, isPublic: false })}
          >
            Private
          </button>
        </div>
        <label className="label">
          <span className="label-text-alt text-gray-500">
            {formData.isPublic 
              ? "Anyone with the public key can vote"
              : "Only users with both public and private keys can vote"
            }
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Start Date</span>
          </label>
          <div className="flex gap-2">
            <DatePicker
              selected={formData.startDate}
              onChange={(date) => setFormData({ ...formData, startDate: date })}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="input input-bordered w-full"
              placeholderText="Select start date"
              required
            />
            <button
              type="button"
              onClick={handleStartNow}
              className="btn btn-sm btn-outline"
            >
              Now
            </button>
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">End Date</span>
          </label>
          <DatePicker
            selected={formData.endDate}
            onChange={(date) => setFormData({ ...formData, endDate: date })}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            className="input input-bordered w-full"
            placeholderText="Select end date"
            required
          />
        </div>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="loading loading-spinner"></span>
            Processing...
          </>
        ) : (
          'Next'
        )}
      </button>
    </form>
  );

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          <li className={stage >= 1 ? "text-primary" : ""}>Campaign Details</li>
          <li className={stage >= 2 ? "text-primary" : ""}>Add Candidates</li>
        </ul>
      </div>

      {stage === 1 && renderStage1()}

      {stage === 2 && campaignId && (
        <div>
          <h2 className="text-xl font-bold mb-4">Add Candidates</h2>
          <CandidateForm
            campaignId={campaignId}
            onSubmitted={handleCandidatesSubmitted}
            onError={(error: string) => {
              console.error('Error adding candidates:', error);
              alert(error);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default NewCampaignPage;
