'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Campaign } from '@/types/campaign'; // Assuming you have a Campaign type defined
import { format } from 'date-fns';

const PastCampaignsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user || !user.id) {
        setLoading(false);
        setError("User not identified. Please log in again."); // Added specific error
        return; // Don't fetch if user is not logged in or ID is missing
      }

      setLoading(true);
      setError(null);
      console.log(`Fetching campaigns for user: ${user.id}`); // Debug log
      try {
        // Ensure this endpoint returns ALL campaigns for the user, regardless of status
        const response = await fetch(`/api/campaigns/user/${user.id}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Try to get error details
          throw new Error(errorData.error || `Failed to fetch campaigns (${response.status})`);
        }
        const data: Campaign[] = await response.json();
        console.log('Raw data from API:', data); // Debug log: See all campaigns returned

        // Filter by end date being in the past (more reliable)
        const now = new Date();
        const endedCampaigns = data.filter((campaign) => {
          if (!campaign.endDate) return false; // Cannot be ended if no end date
          try {
            const endDate = new Date(campaign.endDate);
            // Check if endDate is a valid date and is before the current time
            return !isNaN(endDate.getTime()) && endDate < now;
          } catch (e) {
            console.error(`Invalid date format for campaign ${campaign._id}:`, campaign.endDate);
            return false; // Treat invalid dates as not ended
          }
        });
        console.log('Filtered ended campaigns (by date):', endedCampaigns); // Debug log

        // --- Alternative: Filter by status field (if you are sure it's reliable) ---
        // const endedCampaigns = data.filter((campaign) => campaign.status === 'ended');
        // console.log('Filtered ended campaigns (by status):', endedCampaigns); // Debug log

        setCampaigns(endedCampaigns);
      } catch (err: any) {
        console.error('Error fetching or processing campaigns:', err); // More specific log
        setError(err.message || 'An error occurred while fetching campaigns.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [user]); // Re-fetch when user changes

  const handleViewResults = (campaignId: string) => {
    // TODO: Implement navigation to a detailed results page, e.g., /campaign/[id]/results
    router.push(`/campaign/${campaignId}/results`);
    console.log(`Navigating to results for campaign ${campaignId}`);
  };

  return (
    <ProtectedRoute allowedRoles={['campaignManager', 'admin']}> {/* Adjust roles as needed */}
      <div className="container mx-auto p-4 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Past Campaigns</h1>
          <Link href="/campaign" className="btn btn-outline">
            Back to Dashboard
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Error: {error}</span>
          </div>
        )}

        {!loading && !error && campaigns.length === 0 && (
          <div className="text-center py-10">
            <p className="text-lg text-gray-500">You have no past campaigns.</p>
            <p className="text-md text-gray-400 mt-2">Past campaigns will appear here when they have ended.</p>
          </div>
        )}

        {!loading && !error && campaigns.length > 0 && (
          <div className="overflow-x-auto shadow-xl rounded-lg">
            <table className="table w-full">
              {/* head */}
              <thead className="bg-base-200">
                <tr>
                  <th>Campaign Name</th>
                  <th>End Date</th>
                  <th>Total Votes</th>
                  <th>Status</th> {/* Kept for consistency, but filtering is by date */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign._id} className="hover">
                    <td>
                      <div className="font-bold">{campaign.campaignName}</div>
                      <div className="text-sm opacity-50">{campaign.description?.substring(0, 50)}{campaign.description && campaign.description.length > 50 ? '...' : ''}</div>
                    </td>
                    {/* Ensure endDate exists before formatting */}
                    <td>{campaign.endDate ? format(new Date(campaign.endDate), 'PPP') : 'N/A'}</td>
                    <td>{campaign.totalVotes || 0}</td>
                    <td>
                      {/* Display status based on date logic or the status field if preferred */}
                      <span className="badge badge-ghost badge-sm">Ended</span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewResults(campaign._id)}
                        className="btn btn-primary btn-sm"
                      >
                        View Results
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default PastCampaignsPage;

// Define or import the Campaign type if not already globally available
// Example:
// export interface Campaign {
//   _id: string;
//   campaignName: string;
//   description?: string;
//   startDate?: string;
//   endDate?: string; // Make sure this exists and is a valid date string/object
//   status: 'draft' | 'upcoming' | 'active' | 'ended';
//   isPublic: boolean;
//   totalVotes?: number;
//   publicKey?: string;
//   createdBy: string;
//   candidates?: any[]; // Define candidate type properly
//   announcements?: any[]; // Define announcement type properly
//   createdAt?: string;
//   updatedAt?: string;
//   blockchainId?: string;
//   blockchainTxHash?: string;
// }
