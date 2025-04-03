import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { password, email, userType, name, contactPerson, ...otherData } = body;

    // Validate required fields
    if (!email || !password || !userType) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email, password, and userType are required' 
      }, { status: 400 });
    }

    // Validate user type
    if (!['voter', 'campaign'].includes(userType)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid user type. Must be voter or campaign' 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email already exists' 
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data based on userType
    const userData = {
      email,
      password: hashedPassword,
      userType,
      name: name || (userType === 'campaign' ? otherData.organizationName : ''),
      ...otherData
    };

    // Create the user in the database
    const user = await User.create(userData);

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user._id, 
        email: user.email, 
        userType: user.userType,
        name: user.name
      } 
    }, { status: 201 });
  } catch (error) {
    console.error(`Error in ${req.body?.userType || 'user'} signup:`, error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create user' 
    }, { status: 500 });
  }
} 