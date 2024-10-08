import React from 'react';

interface VoterApplication {
  id: string;
  name: string;
  dob: string;
  address: string;
  idFileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminReviewList: React.FC = () => {
  // This would typically come from an API call
  const applications: VoterApplication[] = [
    // ... sample data
  ];

  const handleApprove = (id: string) => {
    // Implement approval logic
  };

  const handleReject = (id: string) => {
    // Implement rejection logic
  };

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>DOB</th>
            <th>Address</th>
            <th>ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.name}</td>
              <td>{app.dob}</td>
              <td>{app.address}</td>
              <td><a href={app.idFileUrl} target="_blank" rel="noopener noreferrer">View ID</a></td>
              <td>
                <button className="btn btn-sm btn-success mr-2" onClick={() => handleApprove(app.id)}>Approve</button>
                <button className="btn btn-sm btn-error" onClick={() => handleReject(app.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReviewList;
