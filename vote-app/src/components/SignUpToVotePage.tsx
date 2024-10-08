'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const SignUpToVotePage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    address: '',
    idDocument: null as File | null,
  });
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, idDocument: e.target.files[0] });
    }
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
      <h1 className="text-3xl font-bold mb-4">Sign up to Vote</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="date"
              name="dob"
              className="input input-bordered w-full"
              value={formData.dob}
              onChange={handleInputChange}
              required
            />
            <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>Next</button>
          </>
        )}
        {step === 2 && (
          <>
            <input
              type="text"
              name="address"
              placeholder="Address"
              className="input input-bordered w-full"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
            <input
              type="file"
              name="idDocument"
              className="file-input file-input-bordered w-full"
              onChange={handleFileChange}
              required
            />
            <div className="flex justify-between">
              <button type="button" className="btn" onClick={() => setStep(1)}>Back</button>
              <button type="submit" className="btn btn-primary">Submit</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default SignUpToVotePage;
