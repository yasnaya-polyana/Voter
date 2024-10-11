'use client';

import React from 'react';
import Link from 'next/link';

interface PastCampaign {
  id: string;
  name: string;
  endDate: string;
}

const PastCampaignsPage: React.FC = () => {
  // Mock data for past campaigns
  const pastCampaigns: PastCampaign[] = [
    { id: '1', name: 'City Council Election 2022', endDate: '2022-12-31' },
    { id: '2', name: 'School Board Vote 2021', endDate: '2021-09-30' },
    { id: '3', name: 'Local Referendum 2020', endDate: '2020-06-30' },
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Past Campaigns</h1>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>End Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pastCampaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>{campaign.name}</td>
                <td>{campaign.endDate}</td>
                <td>
                  <Link href={`/campaign/results/${campaign.id}`} className="btn btn-sm btn-primary">
                    View Results
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link href="/campaign" className="btn btn-outline mt-8">
        Back to Campaign Management
      </Link>
    </div>
  );
};

export default PastCampaignsPage;
