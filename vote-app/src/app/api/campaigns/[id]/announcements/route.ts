import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Campaign from '../../../../../models/Campaign';
import mongoose from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    const { content } = await request.json();
    
    const campaign = await Campaign.findByIdAndUpdate(
      params.id,
      {
        $push: {
          announcements: {
            content,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const newAnnouncement = campaign.announcements[campaign.announcements.length - 1];
    return NextResponse.json(newAnnouncement);
  } catch (error) {
    console.error('Error posting announcement:', error);
    return NextResponse.json(
      { error: 'Failed to post announcement' },
      { status: 500 }
    );
  }
} 