import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  const authUser = getUserFromRequest(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const user = await User.findByIdAndUpdate(
    authUser.userId,
    { ...body, updated_at: new Date() },
    { new: true }
  );
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    id: user._id.toString(),
    email: user.email,
    full_name: user.full_name,
    preferred_currency: user.preferred_currency,
    date_format: user.date_format,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
    updated_at: user.updated_at,
  });
}
