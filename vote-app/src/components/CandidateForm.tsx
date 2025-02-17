'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CandidateFormProps {
  campaignId: string;
  onSubmitted: () => void;
  onError: (error: string) => void;
}

const CandidateForm: React.FC<CandidateFormProps> = ({ campaignId, onSubmitted, onError }) => {
  const router = useRouter();
  const [candidates, setCandidates] = useState([{ name: '', description: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCandidate = () => {
    setCandidates([...candidates, { name: '', description: '' }]);
  };

  const handleRemoveCandidate = (index: number) => {
    const newCandidates = candidates.filter((_, i) => i !== index);
    setCandidates(newCandidates);
  };

  const handleCandidateChange = (index: number, field: 'name' | 'description', value: string) => {
    const newCandidates = candidates.map((candidate, i) => {
      if (i === index) {
        return { ...candidate, [field]: value };
      }
      return candidate;
    });
    setCandidates(newCandidates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidates }),
      });

      if (!response.ok) throw new Error('Failed to add candidates');

      // Call the onSubmitted callback to trigger the redirect
      onSubmitted();
    } catch (err) {
      console.error('Error:', err);
      onError('Failed to save candidates');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {candidates.map((candidate, index) => (
          <div key={index} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Candidate {index + 1}</h3>
                {candidates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCandidate(index)}
                    className="btn btn-square btn-sm btn-ghost"
                  >
                    ×
                  </button>
                )}
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={candidate.name}
                  onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={candidate.description}
                  onChange={(e) => handleCandidateChange(index, 'description', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={handleAddCandidate}
          className="btn btn-outline w-full"
        >
          Add Another Candidate
        </button>

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
            'Start Now'
          )}
        </button>
      </div>
    </form>
  );
};

export default CandidateForm;

