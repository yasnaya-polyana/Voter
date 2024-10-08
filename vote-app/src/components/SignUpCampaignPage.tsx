'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const SignUpCampaignPage: React.FC = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    email: '',
    phone: '',
    campaignDescription: '',
  });
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    // For now, we'll just redirect to a confirmation page
    router.push('/signup-confirmation');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Sign up to Add Campaign</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="organizationName"
          placeholder="Organization Name"
          className="input input-bordered w-full"
          value={formData.organizationName}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="contactPerson"
          placeholder="Contact Person"
          className="input input-bordered w-full"
          value={formData.contactPerson}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          className="input input-bordered w-full"
          value={formData.phone}
          onChange={handleInputChange}
          required
        />
        <textarea
          name="campaignDescription"
          placeholder="Campaign Description"
          className="textarea textarea-bordered w-full"
          value={formData.campaignDescription}
          onChange={handleInputChange}
          required
        ></textarea>
        <button type="submit" className="btn btn-primary w-full">Submit</button>
      </form>
    </div>
  );
};

export default SignUpCampaignPage;
