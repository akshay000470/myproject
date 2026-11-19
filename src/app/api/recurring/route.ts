import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RecurringTransaction from '@/models/RecurringTransaction';
import { getUserFromRequest } from '@/lib/auth';
import { toPlain } from '@/lib/serialize';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const recs = await RecurringTransaction.find({ user_id: user.userId });
  return NextResponse.json(recs.map(toPlain));
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const rec = await RecurringTransaction.create({ ...body, user_id: user.userId });
  return NextResponse.json(toPlain(rec), { status: 201 });
}
