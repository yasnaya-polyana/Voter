'use client';

import React, { useState, useEffect } from 'react';
import AdminReviewList from '../../components/AdminReviewList';

const CampaignDashboardPage: React.FC = () => {
  const [campaignName, setCampaignName] = useState('');

  useEffect(() => {
    // Fetch campaign details from API or local storage
    setCampaignName('Sample Campaign');
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Campaign Dashboard: {campaignName}</h1>
      <h2 className="text-2xl font-semibold mb-2">User Sign-up Applications</h2>
      <AdminReviewList />
    </div>
  );
};

export default CampaignDashboardPage;
