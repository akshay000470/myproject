import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Account from '@/models/Account';
import { getUserFromRequest } from '@/lib/auth';
import { toPlain } from '@/lib/serialize';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const existing = await Transaction.findOne({ _id: id, user_id: user.userId });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Revert old balance effect
  if (existing.type !== 'transfer') {
    const oldDelta = existing.type === 'income' ? -existing.amount : existing.amount;
    await Account.findByIdAndUpdate(existing.account_id, { $inc: { balance: oldDelta }, updated_at: new Date() });
  }

  const updated = await Transaction.findOneAndUpdate(
    { _id: id, user_id: user.userId },
    { ...body, updated_at: new Date() },
    { new: true }
  );

  // Apply new balance effect
  const newType = body.type || existing.type;
  const newAmount = body.amount !== undefined ? body.amount : existing.amount;
  const newAccId = body.account_id || existing.account_id;
  if (newType !== 'transfer') {
    const newDelta = newType === 'income' ? newAmount : -newAmount;
    await Account.findByIdAndUpdate(newAccId, { $inc: { balance: newDelta }, updated_at: new Date() });
  }

  return NextResponse.json(toPlain(updated));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const tx = await Transaction.findOne({ _id: id, user_id: user.userId });
  if (!tx) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Revert balance
  if (tx.type !== 'transfer') {
    const revertDelta = tx.type === 'income' ? -tx.amount : tx.amount;
    await Account.findByIdAndUpdate(tx.account_id, { $inc: { balance: revertDelta }, updated_at: new Date() });
  }

  await tx.deleteOne();
  return NextResponse.json({ success: true });
}
