import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SavingsGoal from '@/models/SavingsGoal';
import { getUserFromRequest } from '@/lib/auth';
import { toPlain } from '@/lib/serialize';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const goals = await SavingsGoal.find({ user_id: user.userId });
  return NextResponse.json(goals.map(toPlain));
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const goal = await SavingsGoal.create({ ...body, user_id: user.userId });
  return NextResponse.json(toPlain(goal), { status: 201 });
}
