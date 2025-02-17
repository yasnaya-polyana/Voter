'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '../../../../components/ProtectedRoute';

interface VoteDetails {
  id: string;
  campaignName: string;
  voteDate: string;
  status: 'completed' | 'verified';
  verificationHash?: string;
  candidateVotedFor: string;
  totalVotes?: number;
  verifiedAt?: string;
}

const VoteDetailsPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const [voteDetails, setVoteDetails] = useState<VoteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoteDetails = async () => {
      try {
        const response = await fetch(`/api/votes/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch vote details');
        }
        const data = await response.json();
        setVoteDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching vote details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVoteDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-8 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !voteDetails) {
    return (
      <div className="container mx-auto p-8">
        <div className="alert alert-error">
          <p>{error || 'Vote details not found'}</p>
          <Link href="/voter/history" className="btn btn-outline mt-4">
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Vote Details</h1>
      
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">{voteDetails.campaignName}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Vote Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Date Cast:</span> {voteDetails.voteDate}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`badge ml-2 ${voteDetails.status === 'verified' ? 'badge-success' : 'badge-info'}`}>
                    {voteDetails.status}
                  </span>
                </p>
                <p><span className="font-medium">Candidate Selected:</span> {voteDetails.candidateVotedFor}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Verification Details</h3>
              <div className="space-y-2">
                {voteDetails.verificationHash && (
                  <p><span className="font-medium">Verification Hash:</span> 
                    <code className="block mt-1 p-2 bg-base-200 rounded-lg text-sm">
                      {voteDetails.verificationHash}
                    </code>
                  </p>
                )}
                {voteDetails.verifiedAt && (
                  <p><span className="font-medium">Verified At:</span> {voteDetails.verifiedAt}</p>
                )}
                {voteDetails.totalVotes && (
                  <p><span className="font-medium">Total Votes in Campaign:</span> {voteDetails.totalVotes}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card-actions justify-end mt-6">
            <Link href="/voter/history" className="btn btn-outline">
              Back to History
            </Link>
            {voteDetails.status === 'verified' && (
              <button className="btn btn-primary" onClick={() => window.print()}>
                Print Receipt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProtectedVoteDetailsPage = () => (
  <ProtectedRoute allowedUserTypes={['voter']}>
    <VoteDetailsPage />
  </ProtectedRoute>
);

export default ProtectedVoteDetailsPage;