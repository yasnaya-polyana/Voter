'use client';
//8693DD7F
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CountdownTimer from '../../../../components/CountdownTimer';

interface Campaign {
  _id: string;
  campaignName: string;
  description: string;
  isPublic: boolean;
  publicKey: string;
  privateKey?: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'ended';
  candidates: Array<{
    _id: string;
    name: string;
    description: string;
    voteCount: number;
  }>;
  totalVotes: number;
}

const getCampaignStatus = (startDate: string, endDate: string): 'draft' | 'active' | 'ended' => {
  const now = new Date().getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (now < start) return 'draft';
  if (now > end) return 'ended';
  return 'active';
};

const CampaignManagePage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    campaignName: '',
    description: ''
  });
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaign();
  }, [params.id]);

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch campaign');
      const data = await response.json();
      
      console.log('Raw campaign data:', data); // Debug log

      // Ensure we have valid dates
      if (!data.startDate || !data.endDate) {
        throw new Error('Campaign dates are missing');
      }

      // Calculate current status
      const currentStatus = getCampaignStatus(data.startDate, data.endDate);

      setCampaign({
        ...data,
        status: currentStatus
      });
    } catch (error) {
      console.error('Error fetching campaign:', error);
      setError('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/campaigns/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to update campaign');
      
      const updatedCampaign = await response.json();
      setCampaign(prev => ({ ...prev!, ...editForm }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update campaign');
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/campaigns/${params.id}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newAnnouncement }),
      });

      if (!response.ok) throw new Error('Failed to post announcement');
      
      const data = await response.json();
      setCampaign(prev => ({
        ...prev!,
        announcements: [...(prev?.announcements || []), data]
      }));
      setNewAnnouncement('');
    } catch (err) {
      console.error(err);
      alert('Failed to post announcement');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-error">{error || 'Campaign not found'}</div>
      </div>
    );
  }

  // Parse dates once for use in the component
  const startDate = new Date(campaign.startDate);
  const endDate = new Date(campaign.endDate);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Campaign Management</h1>

      {/* Campaign Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stat bg-base-200 rounded-box shadow">
          <div className="stat-title">Total Votes</div>
          <div className="stat-value">{campaign.totalVotes || 0}</div>
        </div>
        <div className="stat bg-base-200 rounded-box shadow">
          <div className="stat-title">Days Remaining</div>
          <div className="stat-value">{Math.max(0, Math.ceil(
            (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          ))}</div>
        </div>
        <div className="stat bg-base-200 rounded-box shadow">
          <div className="stat-title">Status</div>
          <div className="stat-value text-lg capitalize">{campaign.status}</div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Campaign Details</h2>
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="form-control">
                <label className="label">Campaign Name</label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={editForm.campaignName}
                  onChange={(e) => setEditForm({ ...editForm, campaignName: e.target.value })}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">Description</label>
                <textarea
                  className="textarea textarea-bordered"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </form>
          ) : (
            <div>
              <h3 className="font-bold mb-2">{campaign.campaignName}</h3>
              <p className="text-gray-600">{campaign.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Keys Section */}
      <div className="mb-6 p-4 bg-base-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Campaign Access Keys</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Public Key:</label>
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-base-300 rounded font-mono">
                {campaign.publicKey}
              </code>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  navigator.clipboard.writeText(campaign.publicKey);
                  alert('Public key copied to clipboard!');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
          </div>
          {!campaign.isPublic && campaign.privateKey && (
            <div>
              <label className="text-sm font-medium">Private Key:</label>
              <div className="flex items-center gap-2">
                <code className="px-2 py-1 bg-base-300 rounded font-mono">
                  {campaign.privateKey}
                </code>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(campaign.privateKey!);
                    alert('Private key copied to clipboard!');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Status */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Campaign Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>Start: {startDate.toLocaleString()}</p>
            <p>End: {endDate.toLocaleString()}</p>
            <p className="mt-2">
              Status: <span className={`badge ${
                campaign.status === 'active' ? 'badge-success' :
                campaign.status === 'ended' ? 'badge-error' :
                'badge-warning'
              }`}>{campaign.status}</span>
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Time Remaining:</h3>
            <CountdownTimer 
              targetDate={endDate}
              onExpire={fetchCampaign}
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Results</h2>
        <p className="mb-4">Total Votes: {campaign.totalVotes}</p>
        <div className="space-y-4">
          {campaign.candidates.map((candidate) => (
            <div key={candidate._id} className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title">{candidate.name}</h3>
                <div className="mt-2">
                  <progress 
                    className="progress progress-primary w-full" 
                    value={candidate.voteCount || 0} 
                    max={campaign.totalVotes || 1}
                  ></progress>
                  <p className="text-sm mt-1">
                    {candidate.voteCount || 0} votes 
                    ({campaign.totalVotes ? 
                      (((candidate.voteCount || 0) / campaign.totalVotes) * 100).toFixed(1) : 
                      0}%)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4">Announcements</h2>
          
          <form onSubmit={handleAnnouncementSubmit} className="mb-6">
            <div className="form-control">
              <textarea
                className="textarea textarea-bordered"
                placeholder="Write your announcement here..."
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary mt-4">
              Post Announcement
            </button>
          </form>

          <div className="space-y-4">
            {campaign.announcements?.map((announcement) => (
              <div key={announcement._id} className="bg-base-200 p-4 rounded-lg">
                <p>{announcement.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Posted on {new Date(announcement.createdAt).toLocaleDateString()}
                </p>
              </div>
            )).reverse()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignManagePage; 