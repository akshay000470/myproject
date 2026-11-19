import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';
import { getUserFromRequest } from '@/lib/auth';
import { toPlain } from '@/lib/serialize';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const account = await Account.findOneAndUpdate(
    { _id: id, user_id: user.userId },
    { ...body, updated_at: new Date() },
    { new: true }
  );
  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(toPlain(account));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  await Account.findOneAndDelete({ _id: id, user_id: user.userId });
  return NextResponse.json({ success: true });
}
