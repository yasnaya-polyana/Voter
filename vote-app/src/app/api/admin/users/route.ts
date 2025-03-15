import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    await dbConnect();
    // Find all users
    const users = await User.find({})
      .select('email userType name createdAt')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${users.length} users`);
    
    // Format the response
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      email: user.email,
      name: user.name || 'Unknown',
      userType: user.userType,
      createdAt: user.createdAt
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 