'use client'
import React, { useState } from 'react';

interface UserApplication {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  address: string;
  idDocumentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminReviewList: React.FC = () => {
  // Mock data - in a real application, this would come from an API
  const [applications, setApplications] = useState<UserApplication[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      dateOfBirth: '1990-01-01',
      address: '123 Main St, Anytown, USA',
      idDocumentUrl: '/mock-id-document.pdf',
      status: 'pending',
    },
    // Add more mock data as needed
  ]);

  const handleApprove = (id: string) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status: 'approved' } : app
    ));
  };

  const handleReject = (id: string) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status: 'rejected' } : app
    ));
  };

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Date of Birth</th>
            <th>Address</th>
            <th>ID Document</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.name}</td>
              <td>{app.email}</td>
              <td>{app.dateOfBirth}</td>
              <td>{app.address}</td>
              <td>
                <a href={app.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-link">
                  View Document
                </a>
              </td>
              <td>{app.status}</td>
              <td>
                {app.status === 'pending' && (
                  <>
                    <button 
                      className="btn btn-sm btn-success mr-2" 
                      onClick={() => handleApprove(app.id)}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn btn-sm btn-error" 
                      onClick={() => handleReject(app.id)}
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReviewList;
