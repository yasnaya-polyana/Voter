'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className={`btn ${isLoggedIn && user.type === 'voter' ? 'btn-primary' : 'btn-secondary'} m-1`}>
            {isLoggedIn ? (user.type === 'voter' ? 'Voter' : 'Campaign') : 'Menu'}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link href="/">Home</Link></li>
            {!isLoggedIn && (
              <>
                <li><Link href="/login">Login</Link></li>
                <li><Link href="/signup/voter">Sign up to Vote</Link></li>
                <li><Link href="/signup/campaign">Sign up to Add Campaign</Link></li>
              </>
            )}
            {isLoggedIn && user.type === 'voter' && (
              <>
                <li><Link href="/voter">My Dashboard</Link></li>
                <li><Link href="/vote">Vote</Link></li>
                <li><Link href="/history">Voting History</Link></li>
                <li><Link href="/profile">Profile</Link></li>
                <li><Link href="/settings">Settings</Link></li>
              </>
            )}
            {isLoggedIn && user.type === 'campaign' && (
              <>
                <li><Link href="/campaign">Campaign Dashboard</Link></li>
                <li><Link href="/campaign/active">Active Campaigns</Link></li>
                <li><Link href="/campaign/manage-voters">Manage Voters</Link></li>
                <li><Link href="/campaign/results">Results</Link></li>
              </>
            )}
            <li><Link href="/about">About</Link></li>
            <li><Link href="/information">Information</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="navbar-center">
        <Link href="/" className="btn btn-ghost text-xl">Voter</Link>
      </div>
      <div className="navbar-end">
        {isLoggedIn ? (
          <button onClick={handleLogout} className="btn btn-ghost">Logout</button>
        ) : (
          <Link href="/login" className="btn btn-primary">Login</Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
