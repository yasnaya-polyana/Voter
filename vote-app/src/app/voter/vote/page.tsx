'use client';

import React, { useState } from 'react';
import withAuth from '../../../components/withAuth';

const VotePage: React.FC = () => {
  const [publicId, setPublicId] = useState('');
  const [showVotingInterface, setShowVotingInterface] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would validate the public ID against your backend
    // For now, we'll just show the voting interface
    setShowVotingInterface(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Vote in a Campaign</h1>
      {!showVotingInterface ? (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Enter Campaign Public ID</span>
            </label>
            <input
              type="text"
              placeholder="Public ID"
              className="input input-bordered"
              value={publicId}
              onChange={(e) => setPublicId(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary mt-4">
            Access Campaign
          </button>
        </form>
      ) : (
        <div>
          {/* Voting interface goes here */}
          <p>Voting interface for campaign with ID: {publicId}</p>
          {/* You can reuse the voting logic from the original VoterPage here */}
        </div>
      )}
    </div>
  );
};

export default withAuth(VotePage, 'voter');
