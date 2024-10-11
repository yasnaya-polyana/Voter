'use client';

import React from 'react';
import Link from 'next/link';

const ActiveCampaigns: React.FC = () => {
  // Mock data for active campaigns
  const activeCampaigns = [
    { id: 1, name: 'City Council Election 2023', status: 'Ongoing' },
    { id: 2, name: 'School Board Vote', status: 'Upcoming' },
    { id: 3, name: 'Local Referendum', status: 'Ongoing' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Active Campaigns</h1>
      <Link href="/campaign/dashboard" className="btn btn-secondary mb-4">
        Back to Dashboard
      </Link>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeCampaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>{campaign.name}</td>
                <td>{campaign.status}</td>
                <td>
                  <Link href={`/campaign/${campaign.id}`} className="btn btn-sm btn-primary">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveCampaigns;
