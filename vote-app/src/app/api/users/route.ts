import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { password, ...otherData } = body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      ...otherData,
      password: hashedPassword,
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 400 });
  }
}
