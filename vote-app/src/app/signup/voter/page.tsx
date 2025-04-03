'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNear } from '@/context/NearContext';
import Link from 'next/link';

const SignUpToVotePage: React.FC = () => {
  const [stage, setStage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const router = useRouter();
  const { signIn, isSignedIn } = useNear();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Stage 1 validation
    if (stage === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
    }
    
    // Stage 2 validation
    if (stage === 2) {
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
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNextStage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setStage(stage + 1);
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
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: 'voter'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
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
    // Store the voter dashboard as the return URL
    localStorage.setItem('returnUrl', '/voter');
    signIn();
  };

  const handleSkipConnection = () => {
    router.push('/login');
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Sign Up as a Voter</h1>
      
      {/* Success Screen */}
      {registrationComplete ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <div className="text-success text-5xl mb-4">✓</div>
            <h2 className="card-title justify-center">Registration Successful!</h2>
            <p className="py-4">Your voter account has been created successfully.</p>
            
            <div className="divider">NEXT STEPS</div>
            
            <div className="bg-base-200 p-4 rounded-lg mb-4">
              <h3 className="font-bold mb-2">Connect to NEAR Blockchain</h3>
              <p className="mb-4">Connect your NEAR wallet to enable blockchain-verified voting.</p>
              <button onClick={handleConnectWallet} className="btn btn-primary w-full">
                Connect NEAR Wallet
              </button>
            </div>
            
            <div className="mt-2">
              <button onClick={handleSkipConnection} className="btn btn-outline">
                Log In Later
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Registration Form */
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-center mb-6">
              <ul className="steps steps-horizontal w-full">
                <li className={`step ${stage >= 1 ? 'step-primary' : ''}`}>Personal Info</li>
                <li className={`step ${stage >= 2 ? 'step-primary' : ''}`}>Account Setup</li>
              </ul>
            </div>
            
            {registrationError && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{registrationError}</span>
              </div>
            )}
            
            <form onSubmit={stage === 1 ? handleNextStage : handleSubmit} className="space-y-4">
              {stage === 1 && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
                  </div>
                  
                  <div className="card-actions justify-end mt-6">
                    <button type="submit" className="btn btn-primary">
                      Next
                    </button>
                  </div>
                </>
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
                      placeholder="Enter your email address"
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
                  
                  <div className="card-actions justify-between mt-6">
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => setStage(1)}
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="loading loading-spinner loading-xs mr-2"></span>
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </>
              )}
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

export default SignUpToVotePage;