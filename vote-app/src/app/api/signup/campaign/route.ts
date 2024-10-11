import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Campaign from '../../../../models/Campaign';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { password, organizationName, ...otherData } = body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      ...otherData,
      password: hashedPassword,
    });

    const campaign = await Campaign.create({
      campaignName: `${organizationName}'s First Campaign`,
      description: 'Welcome to your first campaign!',
      isPublic: true,
      createdBy: user._id,
    });

    return NextResponse.json({ success: true, user, campaign }, { status: 201 });
  } catch (error) {
    console.error('Error in campaign signup:', error);
    return NextResponse.json({ success: false, error: 'Failed to create user and campaign' }, { status: 400 });
  }
}
