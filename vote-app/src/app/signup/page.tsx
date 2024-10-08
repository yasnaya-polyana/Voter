import React from 'react';
import SignUpToVoteForm from '../../components/SignUpToVoteForm';

const SignUpToVotePage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Sign up to vote</h1>
      <SignUpToVoteForm />
    </div>
  );
};

export default SignUpToVotePage;