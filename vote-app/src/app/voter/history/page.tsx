'use client';

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface VotingHistory {
  id: string;
  campaignName: string;
  voteDate: string;
  status: 'completed' | 'verified';
}

const VotingHistoryPage: React.FC = () => {
  // Mock data for voting history
  const votingHistory: VotingHistory[] = [
    { id: '1', campaignName: 'City Council Election 2023', voteDate: '2023-12-15', status: 'verified' },
    { id: '2', campaignName: 'School Board Vote 2023', voteDate: '2023-09-20', status: 'completed' },
    { id: '3', campaignName: 'Local Referendum 2023', voteDate: '2023-06-10', status: 'verified' },
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Your Voting History</h1>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Vote Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {votingHistory.map((vote) => (
              <tr key={vote.id}>
                <td>{vote.campaignName}</td>
                <td>{vote.voteDate}</td>
                <td>
                  <span className={`badge ${vote.status === 'verified' ? 'badge-success' : 'badge-info'}`}>
                    {vote.status}
                  </span>
                </td>
                <td>
                  <Link href={`/voter/history/${vote.id}`} className="btn btn-sm btn-primary">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link href="/voter" className="btn btn-outline mt-8">
        Back to Voter Dashboard
      </Link>
    </div>
  );
};

const ProtectedVotingHistoryPage = () => (
  <ProtectedRoute allowedUserTypes={['voter']}>
    <VotingHistoryPage />
  </ProtectedRoute>
);

export default ProtectedVotingHistoryPage;
