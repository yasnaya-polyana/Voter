'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Campaign {
  id: string;
  name: string;
  createdBy: string;
}

const CampaignIDManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // In a real application, you would fetch campaigns from an API
    // For now, we'll use mock data
    const mockCampaigns: Campaign[] = [
      { id: 'CAM001', name: 'City Council Election 2023', createdBy: user?.id || '' },
      { id: 'CAM002', name: 'School Board Vote', createdBy: user?.id || '' },
      { id: 'CAM003', name: 'Local Referendum', createdBy: 'other_user' },
    ];

    setCampaigns(mockCampaigns);
  }, [user]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Campaign IDs</h2>
      <ul className="list-disc pl-5">
        {campaigns.filter(campaign => campaign.createdBy === user?.id).map(campaign => (
          <li key={campaign.id} className="mb-2">
            <span className="font-semibold">{campaign.name}:</span> {campaign.id}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CampaignIDManager;
