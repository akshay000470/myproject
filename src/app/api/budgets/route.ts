import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Budget from '@/models/Budget';
import { getUserFromRequest } from '@/lib/auth';
import { toPlain } from '@/lib/serialize';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const budgets = await Budget.find({ user_id: user.userId });
  return NextResponse.json(budgets.map(toPlain));
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { category_id, amount, month_year } = await req.json();
  const budget = await Budget.findOneAndUpdate(
    { user_id: user.userId, category_id, month_year },
    { amount, updated_at: new Date() },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return NextResponse.json(toPlain(budget));
}
