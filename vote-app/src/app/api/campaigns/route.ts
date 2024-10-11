import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Campaign from '../../../models/Campaign';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const campaign = await Campaign.create(body);
    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create campaign' }, { status: 400 });
  }
}
