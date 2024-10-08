import React from 'react';

interface PersonalInfoStepProps {
  nextStep: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  values: { name: string; dob: string };
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ nextStep, handleChange, values }) => {
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Personal Information</h2>
        <input
          type="text"
          placeholder="Full Name"
          className="input input-bordered w-full"
          name="name"
          value={values.name}
          onChange={handleChange}
        />
        <input
          type="date"
          placeholder="Date of Birth"
          className="input input-bordered w-full"
          name="dob"
          value={values.dob}
          onChange={handleChange}
        />
        <button className="btn btn-primary" onClick={nextStep}>Next</button>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
