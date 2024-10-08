import React from 'react';
import AdminReviewList from '../../components/AdminReviewList';

const AdminPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <h2 className="text-2xl font-semibold mb-2">User Sign-up Applications</h2>
      <AdminReviewList />
    </div>
  );
};

export default AdminPage;