'use client';

import React from 'react';
import FAQAccordion from '../../components/FAQAccordion';

const InformationPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <FAQAccordion />
    </div>
  );
};

export default InformationPage;
