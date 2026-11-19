import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Account from '@/models/Account';
import { getUserFromRequest } from '@/lib/auth';
import { toPlain } from '@/lib/serialize';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const txs = await Transaction.find({ user_id: user.userId }).sort({ date: -1 });
  return NextResponse.json(txs.map(toPlain));
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const tx = await Transaction.create({ ...body, user_id: user.userId });

  // Update account balance
  const delta = body.type === 'income' ? body.amount : -body.amount;
  if (body.type !== 'transfer') {
    await Account.findByIdAndUpdate(body.account_id, { $inc: { balance: delta }, updated_at: new Date() });
  }

  return NextResponse.json(toPlain(tx), { status: 201 });
}
