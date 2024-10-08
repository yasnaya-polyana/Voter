'use client';

import React from 'react';

const InformationPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="join join-vertical w-full">
        <div className="collapse collapse-arrow join-item border border-base-300">
          <input type="radio" name="my-accordion-4" checked="checked" /> 
          <div className="collapse-title text-xl font-medium">
            What is Voter App?
          </div>
          <div className="collapse-content"> 
            <p>Voter App is a secure and transparent platform for conducting online voting. It allows users to participate in various campaigns and elections with ease and confidence.</p>
          </div>
        </div>
        <div className="collapse collapse-arrow join-item border border-base-300">
          <input type="radio" name="my-accordion-4" /> 
          <div className="collapse-title text-xl font-medium">
            How do I sign up to vote?
          </div>
          <div className="collapse-content"> 
            <p>To sign up as a voter, click on the "Sign up to Vote" button on the homepage. You'll need to provide some personal information and upload a valid ID for verification.</p>
          </div>
        </div>
        <div className="collapse collapse-arrow join-item border border-base-300">
          <input type="radio" name="my-accordion-4" /> 
          <div className="collapse-title text-xl font-medium">
            Can I create my own voting campaign?
          </div>
          <div className="collapse-content"> 
            <p>Yes! You can create your own voting campaign by clicking on the "Sign up to Add Campaign" button. You'll need to provide details about your organization and the campaign you want to run.</p>
          </div>
        </div>
        <div className="collapse collapse-arrow join-item border border-base-300">
          <input type="radio" name="my-accordion-4" /> 
          <div className="collapse-title text-xl font-medium">
            How is my vote kept secure and private?
          </div>
          <div className="collapse-content"> 
            <p>We use advanced encryption techniques to ensure the security and privacy of your vote. Our system is designed to maintain anonymity while preventing any tampering or double-voting.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationPage;
