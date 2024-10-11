import React from 'react';
import Link from 'next/link';
import CampaignReviewList from '../../../components/CampaignReviewList';

const ManageVotersPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Campaign Dashboard</h1>
      <div className="mb-6">
        <Link href="/campaign/active" className="btn btn-primary">
          View Active Campaigns
        </Link>
      </div>
      <h2 className="text-2xl font-semibold mb-2">User Sign-up Applications</h2>
      <CampaignReviewList />
    </div>
  );
};

export default ManageVotersPage;