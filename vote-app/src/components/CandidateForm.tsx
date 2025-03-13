'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNear } from '@/context/NearContext';


interface CandidateFormProps {
  campaignId: string;
  onSubmitted: () => void;
  onError: (error: string) => void;
}

const CandidateForm: React.FC<CandidateFormProps> = ({ campaignId, onSubmitted, onError }) => {
  const router = useRouter();
  const { wallet, isSignedIn } = useNear();
  const [candidates, setCandidates] = useState([{ name: '', description: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCandidate = () => {
    setCandidates([...candidates, { name: '', description: '' }]);
  };

  const handleRemoveCandidate = (index: number) => {
    const newCandidates = candidates.filter((_, i) => i !== index);
    setCandidates(newCandidates);
  };

  const handleCandidateChange = (index: number, field: 'name' | 'description', value: string) => {
    const newCandidates = candidates.map((candidate, i) => {
      if (i === index) {
        return { ...candidate, [field]: value };
      }
      return candidate;
    });
    setCandidates(newCandidates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Starting candidate submission process...');
      
      // First save candidates to MongoDB
      console.log('Saving candidates to MongoDB for campaign:', campaignId);
      const response = await fetch(`/api/campaigns/${campaignId}/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidates }),
      });

      if (!response.ok) {
        console.error('Failed to save candidates to MongoDB:', response.status);
        throw new Error('Failed to add candidates');
      }
      
      console.log('Candidates saved to MongoDB successfully');
      
      // Now get the campaign details including blockchainId
      console.log('Fetching campaign details to get blockchainId...');
      const campaignResponse = await fetch(`/api/campaigns/${campaignId}`);
      if (!campaignResponse.ok) {
        console.error('Failed to fetch campaign details:', campaignResponse.status);
        throw new Error('Failed to fetch campaign details');
      }
      
      const campaignData = await campaignResponse.json();
      console.log('Campaign data retrieved:', campaignData);
      
      // Check if we have what we need for blockchain creation
      console.log('Checking blockchain prerequisites:');
      console.log('- blockchainId:', campaignData.blockchainId);
      console.log('- wallet available:', !!wallet);
      console.log('- isSignedIn:', isSignedIn);
      
      // Create campaign on blockchain if needed
      if (campaignData.blockchainId && wallet && isSignedIn) {
        console.log('Creating campaign on blockchain with ID:', campaignData.blockchainId);
        
        try {
          const contract = getContract(wallet.account());
          
          // Log the contract object to see if it's initialized correctly
          console.log('Contract object:', {
            contractId: contract.contractId,
            hasCreateCampaign: typeof contract.create_campaign === 'function'
          });
          
          // Generate a description from the campaign name if not provided
          const campaignDescription = campaignData.description || 
            `Voting campaign for ${campaignData.campaignName}`;
          
          // Log the exact parameters being sent to the contract
          const createParams = {
            campaign_id: campaignData.blockchainId,
            title: campaignData.campaignName,
            description: campaignDescription,
            candidates: candidates.map(c => ({ 
              id: c.id, 
              name: c.name 
            }))
          };
          
          console.log('🔗 BLOCKCHAIN: Create campaign parameters:', JSON.stringify(createParams));
          
          // Add gas and deposit parameters explicitly
          const gas = '300000000000000'; // 300 TGas
          const deposit = '0'; // No deposit needed
          
          console.log('🔗 BLOCKCHAIN: Calling create_campaign with gas:', gas);
          
          // Create the campaign on the blockchain with explicit gas
          const result = await contract.create_campaign(
            createParams,
            gas,
            deposit
          );
          
          console.log('🔗 BLOCKCHAIN: Campaign created successfully:', result);
          
          // After successful blockchain transaction
          if (result && result.transaction && result.transaction.hash) {
            console.log('🔗 BLOCKCHAIN: Transaction hash:', result.transaction.hash);
            
            // Store the transaction hash in the database
            try {
              const updateResponse = await fetch(`/api/campaigns/${campaignId}/update`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  blockchainTxHash: result.transaction.hash,
                  status: 'active' // Update status to active
                }),
              });
              
              if (!updateResponse.ok) {
                console.error('Failed to store transaction hash:', await updateResponse.text());
              } else {
                console.log('Transaction hash stored successfully');
              }
            } catch (updateError) {
              console.error('Error storing transaction hash:', updateError);
            }
          } else {
            console.warn('No transaction hash found in result:', result);
          }
        } catch (blockchainError) {
          console.error('❌ BLOCKCHAIN ERROR:', blockchainError);
          
          // Extract more detailed error information
          let errorDetails = 'Unknown error';
          if (blockchainError.message) {
            errorDetails = blockchainError.message;
          }
          
          // Check for specific error types
          if (errorDetails.includes('MethodNotFound')) {
            console.error('❌ BLOCKCHAIN ERROR: The method "create_campaign" does not exist in the contract');
          } else if (errorDetails.includes('GasExceeded')) {
            console.error('❌ BLOCKCHAIN ERROR: Not enough gas provided for the transaction');
          } else if (errorDetails.includes('NotEnoughBalance')) {
            console.error('❌ BLOCKCHAIN ERROR: Not enough NEAR balance to complete the transaction');
          }
          
          // Continue anyway since we've created the MongoDB record
          console.warn('⚠️ BLOCKCHAIN WARNING: Campaign created in MongoDB but blockchain creation failed');
        }
      } else {
        console.warn('Skipping blockchain creation due to missing prerequisites:', {
          hasBlockchainId: !!campaignData.blockchainId,
          hasWallet: !!wallet,
          isSignedIn: !!isSignedIn
        });
      }

      // Call the onSubmitted callback to trigger the redirect
      console.log('Calling onSubmitted to complete the process');
      onSubmitted();
    } catch (err) {
      console.error('Error in candidate submission process:', err);
      onError('Failed to save candidates');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {candidates.map((candidate, index) => (
          <div key={index} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Candidate {index + 1}</h3>
                {candidates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCandidate(index)}
                    className="btn btn-square btn-sm btn-ghost"
                  >
                    ×
                  </button>
                )}
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={candidate.name}
                  onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={candidate.description}
                  onChange={(e) => handleCandidateChange(index, 'description', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={handleAddCandidate}
          className="btn btn-outline w-full"
        >
          Add Another Candidate
        </button>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner"></span>
              Processing...
            </>
          ) : (
            'Start Now'
          )}
        </button>
      </div>
    </form>
  );
};

export default CandidateForm;

