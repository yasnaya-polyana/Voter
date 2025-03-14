import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vote from '@/models/Vote';
import Campaign from '@/models/Campaign';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Get the accountId from the query parameters
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Find the vote by ID and ensure it belongs to the requesting user
    const vote = await Vote.findOne({ 
      _id: params.id,
      $or: [
        { userId: accountId },
        { voterAccountId: accountId }
      ]
    });
    
    if (!vote) {
      return NextResponse.json(
        { error: 'Vote not found or you do not have permission to view it' },
        { status: 404 }
      );
    }

    // Get the campaign details
    const campaign = await Campaign.findOne({ _id: vote.campaignId });
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign associated with this vote not found' },
        { status: 404 }
      );
    }

    // Format the response
    const voteDetails = {
      _id: vote._id.toString(),
      campaignId: vote.campaignId.toString(),
      campaignName: vote.campaignName || campaign.campaignName,
      candidateVoted: vote.candidateName || vote.candidateVotedFor,
      voteDate: vote.voteDate || vote.createdAt,
      publicKey: campaign.publicKey,
      status: vote.status,
      verificationHash: vote.verificationHash,
      blockchainTxHash: vote.blockchainTxHash || campaign.blockchainTxHash,
      campaign: {
        _id: campaign._id.toString(),
        campaignName: campaign.campaignName,
        description: campaign.description,
        isPublic: campaign.isPublic,
        publicKey: campaign.publicKey,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status,
        totalVotes: campaign.totalVotes,
        candidates: campaign.candidates.map(candidate => ({
          _id: candidate._id.toString(),
          name: candidate.name,
          description: candidate.description || '',
          voteCount: candidate.voteCount || 0
        })),
        blockchainId: campaign.blockchainId,
        blockchainTxHash: campaign.blockchainTxHash
      }
    };

    return NextResponse.json({
      success: true,
      vote: voteDetails
    });
  } catch (error) {
    console.error('Error fetching vote details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch vote details' },
      { status: 500 }
    );
  }
}
