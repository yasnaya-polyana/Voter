"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const SignUpToVoteForm: React.FC = () => {
  const [stage, setStage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    idImage: null as File | null,
  });
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prevData => ({ ...prevData, idImage: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stage < 3) {
      setStage(stage + 1);
    } else {
      // Handle form submission
      console.log('Form submitted:', formData);
      // Redirect to voter page (assuming successful registration)
      router.push('/voter');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center mb-6">
        <div className="radial-progress" style={{ "--value": stage * 33 }} role="progressbar">
          {stage * 33}%
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {stage === 1 && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">What is your name?</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
        )}
        {stage === 2 && (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="input input-bordered w-full"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone Number</span>
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                className="input input-bordered w-full"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Address</span>
              </label>
              <input
                type="text"
                name="address"
                placeholder="Address"
                className="input input-bordered w-full"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="input input-bordered w-full"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        )}
        {stage === 3 && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Upload Passport/ID</span>
            </label>
            <input
              type="file"
              name="idImage"
              accept="image/*"
              className="file-input file-input-bordered w-full"
              onChange={handleFileChange}
              required
            />
          </div>
        )}
        <button type="submit" className="btn btn-primary w-full">
          {stage < 3 ? 'Next' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default SignUpToVoteForm;
