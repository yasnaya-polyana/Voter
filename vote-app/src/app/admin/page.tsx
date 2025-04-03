'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Campaign {
  _id: string;
  campaignName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'upcoming' | 'active' | 'ended';
  isPublic: boolean;
  totalVotes: number;
  publicKey: string;
  createdBy: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'voter' | 'campaign' | 'admin';
  createdAt: string;
}

interface SystemStats {
  counts: {
    totalCampaigns: number;
    totalVotes: number;
    totalUsers: number;
  };
  distributions: {
    userTypes: Record<string, number>;
    campaignStatuses: Record<string, number>;
  };
  timelines: {
    votes: Array<{ date: string; count: number }>;
  };
  topCampaigns: Array<{
    id: string;
    name: string;
    totalVotes: number;
  }>;
  recentActivity: {
    votes: Array<{
      id: string;
      campaignName: string;
      candidateName: string;
      date: string;
    }>;
    campaigns: Array<{
      id: string;
      name: string;
      createdBy: string;
      date: string;
    }>;
  };
}

const AdminDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'users' | 'tools'>('dashboard');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState<string>(process.env.NEXT_PUBLIC_ADMIN_API_KEY || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'user' | 'campaign'; id: string } | null>(null);

  useEffect(() => {
    if (!user || user.userType !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all campaigns
        const campaignsResponse = await fetch('/api/campaigns/all');
        if (!campaignsResponse.ok) {
          throw new Error('Failed to fetch campaigns');
        }
        const campaignsData = await campaignsResponse.json();
        setCampaigns(campaignsData);

        // Fetch all users
        try {
          const usersResponse = await fetch('/api/admin/users');
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setUsers(usersData.users || []);
          }
        } catch (userError) {
          console.error('Error fetching users:', userError);
        }

        // Fetch system statistics
        try {
          const statsResponse = await fetch('/api/admin/stats');
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setSystemStats(statsData.stats);
          }
        } catch (statsError) {
          console.error('Error fetching system statistics:', statsError);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const handleFixVotes = async (campaignId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns/fix-votes?campaignId=${campaignId}&adminKey=${adminKey}`);
      
      if (!response.ok) {
        throw new Error('Failed to fix vote counts');
      }
      
          const data = await response.json();
      console.log('Vote counts fixed:', data);
      
      // Refresh the campaigns list
      const campaignsResponse = await fetch('/api/campaigns/all');
      if (!campaignsResponse.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      const campaignsData = await campaignsResponse.json();
      setCampaigns(campaignsData);
      
      alert('Vote counts fixed successfully!');
    } catch (err) {
      console.error('Error fixing vote counts:', err);
      alert('Failed to fix vote counts. Please try again later.');
        } finally {
          setLoading(false);
        }
  };

  const handleViewUserDetails = async (userId: string) => {
    setUserDetailsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      const data = await response.json();
      setUserDetails(data.user);
      
      // Find the user in the users array
      const selectedUser = users.find(u => u.id === userId) || null;
      setSelectedUser(selectedUser);
    } catch (err) {
      console.error('Error fetching user details:', err);
      alert('Failed to fetch user details. Please try again later.');
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      const data = await response.json();
      console.log('User deleted:', data);
      
      // Refresh the users list
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }
      
      // Close user details
      setSelectedUser(null);
      setUserDetails(null);
      
      // Clear delete confirmation
      setConfirmDelete(null);
      
      alert('User deleted successfully!');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }
      
      const data = await response.json();
      console.log('Campaign deleted:', data);
      
      // Refresh the campaigns list
      const campaignsResponse = await fetch('/api/campaigns/all');
      if (!campaignsResponse.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      const campaignsData = await campaignsResponse.json();
      setCampaigns(campaignsData);
      
      // Clear delete confirmation
      setConfirmDelete(null);
      
      alert(`Campaign deleted successfully! ${data.stats.votesDeleted} votes were also deleted.`);
    } catch (err) {
      console.error('Error deleting campaign:', err);
      alert('Failed to delete campaign. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !campaigns.length && !users.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
        <Link href="/admin/create" className="btn btn-primary">
            Create Admin
          </Link>
          <Link href="/" className="btn btn-outline">
            Home
        </Link>
        </div>
      </div>

      <div className="tabs tabs-boxed mb-6">
        <a 
          className={`tab ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </a>
        <a 
          className={`tab ${activeTab === 'campaigns' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('campaigns')}
        >
          Campaigns
        </a>
        <a 
          className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </a>
        <a 
          className={`tab ${activeTab === 'tools' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          Admin Tools
        </a>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">System Overview</h2>
          
          {systemStats ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="stats shadow w-full">
                <div className="stat">
                  <div className="stat-title">Total Campaigns</div>
                  <div className="stat-value">{systemStats.counts.totalCampaigns}</div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Total Votes</div>
                  <div className="stat-value">{systemStats.counts.totalVotes}</div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Total Users</div>
                  <div className="stat-value">{systemStats.counts.totalUsers}</div>
                </div>
              </div>
              
              {/* User Type Distribution */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">User Distribution</h3>
                  <div className="flex gap-4">
                    {Object.entries(systemStats.distributions.userTypes).map(([type, count]) => (
                      <div key={type} className="stat">
                        <div className="stat-title">{type.charAt(0).toUpperCase() + type.slice(1)}s</div>
                        <div className="stat-value">{count}</div>
                        <div className="stat-desc">
                          {((count / systemStats.counts.totalUsers) * 100).toFixed(1)}% of users
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Campaign Status Distribution */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Campaign Status Distribution</h3>
                  <div className="flex gap-4">
                    {Object.entries(systemStats.distributions.campaignStatuses).map(([status, count]) => (
                      <div key={status} className="stat">
                        <div className="stat-title">{status.charAt(0).toUpperCase() + status.slice(1)}</div>
                        <div className="stat-value">{count}</div>
                        <div className="stat-desc">
                          {((count / systemStats.counts.totalCampaigns) * 100).toFixed(1)}% of campaigns
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Top Campaigns */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">Top Campaigns by Votes</h3>
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>Campaign Name</th>
                          <th>Total Votes</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {systemStats.topCampaigns.map((campaign) => (
                          <tr key={campaign.id}>
                            <td>{campaign.name}</td>
                            <td>{campaign.totalVotes}</td>
                            <td>
                              <button 
                                className="btn btn-xs btn-outline"
                                onClick={() => router.push(`/campaign/${campaign.id}/manage`)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                  <h3 className="card-title">Recent Activity</h3>
                  <div className="tabs">
                    <a className="tab tab-bordered tab-active">Recent Votes</a>
                    <a className="tab tab-bordered">Recent Campaigns</a>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>Campaign</th>
                          <th>Candidate</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {systemStats.recentActivity.votes.map((vote) => (
                          <tr key={vote.id}>
                            <td>{vote.campaignName}</td>
                            <td>{vote.candidateName}</td>
                            <td>{new Date(vote.date).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              <span>System statistics are not available. Please check the API implementation.</span>
            </div>
          )}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">All Campaigns</h2>
            <div className="form-control">
              <input
                type="text"
                placeholder="Search campaigns..."
                className="input input-bordered"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Public/Private</th>
                  <th>Votes</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign._id}>
                    <td>{campaign.campaignName}</td>
                    <td>
                      <span className={`badge ${
                        campaign.status === 'active' ? 'badge-success' :
                        campaign.status === 'ended' ? 'badge-error' :
                        campaign.status === 'upcoming' ? 'badge-warning' :
                        'badge-ghost'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td>{campaign.isPublic ? 'Public' : 'Private'}</td>
                    <td>{campaign.totalVotes}</td>
                    <td>{campaign.createdBy}</td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-xs btn-outline"
                          onClick={() => router.push(`/campaign/${campaign._id}/manage`)}
                        >
                          View
                        </button>
                        <button 
                          className="btn btn-xs btn-secondary"
                          onClick={() => handleFixVotes(campaign._id)}
                        >
                          Fix Votes
                        </button>
                        <button 
                          className="btn btn-xs btn-error"
                          onClick={() => setConfirmDelete({ type: 'campaign', id: campaign._id })}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">All Users</h2>
            </div>
            
            <div className="form-control mb-4">
              <input
                type="text"
                placeholder="Search users..."
                className="input input-bordered"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {filteredUsers.length > 0 ? (
              <div className="overflow-y-auto max-h-[70vh]">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr 
                        key={user.id} 
                        className={selectedUser?.id === user.id ? 'bg-base-200' : ''}
                      >
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${
                            user.userType === 'admin' ? 'badge-primary' :
                            user.userType === 'campaign' ? 'badge-secondary' :
                            'badge-ghost'
                          }`}>
                            {user.userType}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-xs btn-outline"
                            onClick={() => handleViewUserDetails(user.id)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert alert-info">
                <span>No users found matching your search.</span>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            {selectedUser ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <h3 className="card-title text-xl">User Details</h3>
                    <button 
                      className="btn btn-sm btn-error"
                      onClick={() => setConfirmDelete({ type: 'user', id: selectedUser.id })}
                    >
                      Delete User
                    </button>
                  </div>
                  
                  {userDetailsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="loading loading-spinner loading-lg"></div>
                    </div>
                  ) : userDetails ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm opacity-70">Email</p>
                          <p className="font-semibold">{userDetails.email}</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-70">Name</p>
                          <p className="font-semibold">{userDetails.name || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-70">User Type</p>
                          <p className="font-semibold">{userDetails.userType}</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-70">Created At</p>
                          <p className="font-semibold">{new Date(userDetails.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="divider"></div>
                      
                      <div>
                        <h4 className="font-bold mb-2">User Statistics</h4>
                        <div className="stats shadow">
                          {userDetails.userType === 'campaign' && (
                            <div className="stat">
                              <div className="stat-title">Campaigns Created</div>
                              <div className="stat-value">{userDetails.stats.campaignsCreated}</div>
                            </div>
                          )}
                          
                          {userDetails.userType === 'voter' && (
                            <div className="stat">
                              <div className="stat-title">Votes Cast</div>
                              <div className="stat-value">{userDetails.stats.votesCast}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      <span>Select a user to view details.</span>
                    </div>
                  )}
                </div>
        </div>
      ) : (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">User Details</h3>
                  <p>Select a user to view details.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Tools Tab */}
      {activeTab === 'tools' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Admin Tools</h2>
          
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h3 className="card-title">User Lookup</h3>
              <p className="mb-4">Search for a user by email or name to manage their account.</p>
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Search User</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    className="input input-bordered flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter email or name"
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('users')}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h3 className="card-title">Admin Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h4 className="card-title text-lg">Create Admin User</h4>
                    <p>Create a new administrator account with full system access.</p>
                    <div className="card-actions justify-end mt-2">
                      <Link href="/admin/create" className="btn btn-primary btn-sm">
                        Create Admin
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h4 className="card-title text-lg">Fix Campaign Votes</h4>
                    <p>Repair vote counts for campaigns with discrepancies.</p>
                    <div className="card-actions justify-end mt-2">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setSelectedCampaign(null);
                          setActiveTab('campaigns');
                        }}
                      >
                        Go to Campaigns
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h4 className="card-title text-lg">System Statistics</h4>
                    <p>View detailed statistics about system usage and activity.</p>
                    <div className="card-actions justify-end mt-2">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => setActiveTab('dashboard')}
                      >
                        View Dashboard
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h4 className="card-title text-lg">User Management</h4>
                    <p>Manage user accounts, reset passwords, or delete users.</p>
                    <div className="card-actions justify-end mt-2">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => setActiveTab('users')}
                      >
                        Manage Users
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">System Information</h3>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Total Campaigns</div>
                  <div className="stat-value">{campaigns.length}</div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Total Users</div>
                  <div className="stat-value">{users.length}</div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Total Votes</div>
                  <div className="stat-value">
                    {campaigns.reduce((sum, campaign) => sum + (campaign.totalVotes || 0), 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p className="py-4">
              Are you sure you want to delete this {confirmDelete.type}? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-outline"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-error"
                onClick={() => {
                  if (confirmDelete.type === 'user') {
                    handleDeleteUser(confirmDelete.id);
                  } else {
                    handleDeleteCampaign(confirmDelete.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProtectedAdminDashboard = () => (
  <ProtectedRoute allowedUserTypes={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
);

export default ProtectedAdminDashboard;
