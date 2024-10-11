import React from 'react';

const FAQAccordion: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="collapse collapse-plus bg-base-200">
        <input type="radio" name="faq-accordion" defaultChecked />
        <div className="collapse-title text-xl font-medium">
          What is Voter App?
        </div>
        <div className="collapse-content">
          <p>Voter App is a secure and transparent platform for conducting online voting. It allows users to participate in various campaigns and elections with ease and confidence. Our system ensures the integrity of each vote while maintaining user privacy.</p>
        </div>
      </div>

      <div className="collapse collapse-plus bg-base-200">
        <input type="radio" name="faq-accordion" />
        <div className="collapse-title text-xl font-medium">
          How do I sign up to vote?
        </div>
        <div className="collapse-content">
          <p>To sign up as a voter, click on the "Sign up to Vote" button on the homepage. You'll need to provide some personal information and upload a valid ID for verification. Our team will review your application to ensure eligibility.</p>
        </div>
      </div>

      <div className="collapse collapse-plus bg-base-200">
        <input type="radio" name="faq-accordion" />
        <div className="collapse-title text-xl font-medium">
          Can I create my own voting campaign?
        </div>
        <div className="collapse-content">
          <p>Yes! You can create your own voting campaign by clicking on the "Sign up to Add Campaign" button. You'll need to provide details about your organization and the campaign you want to run. Our team will review your application to ensure it meets our guidelines.</p>
        </div>
      </div>

      <div className="collapse collapse-plus bg-base-200">
        <input type="radio" name="faq-accordion" />
        <div className="collapse-title text-xl font-medium">
          How is my vote kept secure and private?
        </div>
        <div className="collapse-content">
          <p>We use advanced encryption techniques to ensure the security and privacy of your vote. Our system is designed to maintain anonymity while preventing any tampering or double-voting. All data is stored on secure servers with multiple layers of protection.</p>
        </div>
      </div>

      <div className="collapse collapse-plus bg-base-200">
        <input type="radio" name="faq-accordion" />
        <div className="collapse-title text-xl font-medium">
          What types of elections can be held on Voter App?
        </div>
        <div className="collapse-content">
          <p>Voter App supports a wide range of elections, including but not limited to: political elections, corporate board elections, club and organization leadership votes, and community decision-making processes. If you have a specific type of election in mind, please contact us for more information.</p>
        </div>
      </div>
    </div>
  );
};

export default FAQAccordion;
