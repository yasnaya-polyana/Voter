import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { password, organizationName, email, contactPerson } = body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      userType: 'campaign',
      organizationName,
      contactPerson
    });

    return NextResponse.json({ success: true, user: { id: user._id, email: user.email, userType: user.userType } }, { status: 201 });
  } catch (error) {
    console.error('Error in campaign signup:', error);
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}
