'use client';

import React from 'react';
import Link from 'next/link';
import CampaignIDManager from '../../components/CampaignIDManager';

const CampaignPage: React.FC = () => {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">Campaign Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/campaign/active" className="btn btn-primary btn-lg">
            View Active Campaigns
          </Link>
          <Link href="/campaign/new" className="btn btn-secondary btn-lg">
            Add New Campaign
          </Link>
          <Link href="/campaign/past" className="btn btn-outline btn-lg">
            View Past Campaigns
          </Link>
        </div>
        <p className="mt-8 text-lg">
          Welcome to the Campaign Management page. Here you can manage your active campaigns,
          create new ones, or review past campaigns.
        </p>
        <CampaignIDManager />
      </div>
    );
  };

export default CampaignPage;