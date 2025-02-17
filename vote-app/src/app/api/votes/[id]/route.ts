import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Vote from '../../../../models/Vote';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const vote = await Vote.findById(params.id)
      .select('campaignName voteDate status verificationHash candidateVotedFor totalVotes verifiedAt')
      .lean();

    if (!vote) {
      return NextResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    return NextResponse.json(vote);
  } catch (error) {
    console.error('Error fetching vote details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
