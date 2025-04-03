'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNear } from '@/context/NearContext';
import Link from 'next/link';

const SignUpCampaignPage: React.FC = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();
  const { signIn } = useNear();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }
    
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setRegistrationError(null);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.organizationName,
          contactPerson: formData.contactPerson,
          email: formData.email,
          password: formData.password,
          userType: 'campaign',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Registration successful
      setRegistrationComplete(true);
      
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectWallet = () => {
    // Store the campaign dashboard as the return URL
    localStorage.setItem('returnUrl', '/campaign');
    signIn();
  };

  const handleLoginNow = async () => {
    try {
      setIsSubmitting(true);
      // Log in with the credentials just created
      const loginResult = await login(formData.email, formData.password);
      
      if (loginResult.success) {
        // Redirect directly to the campaign dashboard
        router.push('/campaign');
      } else {
        throw new Error(loginResult.error || 'Failed to log in');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Direct to login page manually if auto-login fails
      router.push('/login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Sign Up as Campaign Organizer</h1>
      
      {/* Success Screen */}
      {registrationComplete ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <div className="text-success text-5xl mb-4">✓</div>
            <h2 className="card-title justify-center">Campaign Account Created!</h2>
            <p className="py-4">Your campaign organizer account has been created successfully.</p>
            
            <div className="divider">NEXT STEPS</div>
            
            <div className="bg-base-200 p-4 rounded-lg mb-4">
              <h3 className="font-bold mb-2">Connect to NEAR Blockchain</h3>
              <p className="mb-4">Connect your NEAR wallet to enable creating blockchain-verified campaigns.</p>
              <button onClick={handleConnectWallet} className="btn btn-primary w-full">
                Connect NEAR Wallet
              </button>
            </div>
            
            <div className="mt-2">
              <button 
                onClick={handleLoginNow} 
                className="btn btn-outline w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-xs mr-2"></span>
                    Logging in...
                  </>
                ) : (
                  'Log In Now'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Registration Form */
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {registrationError && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{registrationError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Organization Name</span>
                </label>
                <input
                  type="text"
                  name="organizationName"
                  placeholder="Enter your organization's name"
                  className={`input input-bordered w-full ${errors.organizationName ? 'input-error' : ''}`}
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  required
                />
                {errors.organizationName && <p className="text-error text-sm mt-1">{errors.organizationName}</p>}
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Contact Person</span>
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  placeholder="Name of primary contact"
                  className={`input input-bordered w-full ${errors.contactPerson ? 'input-error' : ''}`}
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  required
                />
                {errors.contactPerson && <p className="text-error text-sm mt-1">{errors.contactPerson}</p>}
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address for account"
                  className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                {errors.password && <p className="text-error text-sm mt-1">{errors.password}</p>}
                <label className="label">
                  <span className="label-text-alt">Password must be at least 8 characters</span>
                </label>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                {errors.confirmPassword && <p className="text-error text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-xs mr-2"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Campaign Account'
                )}
              </button>
            </form>
            
            <div className="text-center mt-6">
              <p>Already have an account? <Link href="/login" className="link link-primary">Log In</Link></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpCampaignPage;
