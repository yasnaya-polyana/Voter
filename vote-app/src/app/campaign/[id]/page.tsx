'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Campaign {
  _id: string;
  campaignName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  publicKey: string;
  candidates: Array<{
    name: string;
    description?: string;
    imageUrl?: string;
  }>;
}

export default function CampaignPage() {
  const params = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        console.log('Fetching campaign with ID:', params.id); // Debug log
        const response = await fetch(`/api/campaigns/${params.id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch campaign');
        }

        if (data.success && data.campaign) {
          console.log('Campaign data:', data.campaign); // Debug log
          setCampaign(data.campaign);
        } else {
          throw new Error('Campaign not found');
        }
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError(err instanceof Error ? err.message : 'Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCampaign();
    }
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!campaign) return <div>Campaign not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{campaign.campaignName}</h1>
      <div className="grid gap-4">
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Campaign Details</h2>
          <p><strong>Description:</strong> {campaign.description}</p>
          <p><strong>Start Date:</strong> {new Date(campaign.startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> {new Date(campaign.endDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {campaign.status}</p>
          <p><strong>Public Key:</strong> {campaign.publicKey}</p>
        </div>

        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Candidates</h2>
          {campaign.candidates && campaign.candidates.length > 0 ? (
            <div className="grid gap-4">
              {campaign.candidates.map((candidate, index) => (
                <div key={index} className="border p-2 rounded">
                  <h3 className="font-semibold">{candidate.name}</h3>
                  {candidate.description && <p>{candidate.description}</p>}
                  {candidate.imageUrl && (
                    <img 
                      src={candidate.imageUrl} 
                      alt={candidate.name}
                      className="mt-2 max-w-xs rounded"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No candidates added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
} 