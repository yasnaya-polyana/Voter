import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
  }
}
