import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { getUserFromRequest } from '@/lib/auth';
import { toPlain } from '@/lib/serialize';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const cats = await Category.find({ user_id: user.userId }).sort({ name: 1 });
  return NextResponse.json(cats.map(toPlain));
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const cat = await Category.create({ ...body, user_id: user.userId });
  return NextResponse.json(toPlain(cat), { status: 201 });
}
