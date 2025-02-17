import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Campaign from '../../../../../models/Campaign';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  await dbConnect();

  try {
    const campaigns = await Campaign.find({
      createdBy: params.userId,
      status: 'active',
      endDate: { $gt: new Date() } // Only get campaigns that haven't ended
    })
      .select('id name description startDate endDate status isPublic')
      .sort({ startDate: -1 }) // Sort by start date, newest first
      .lean();

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching active campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active campaigns' },
      { status: 500 }
    );
  }
}
