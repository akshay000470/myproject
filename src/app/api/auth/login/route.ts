import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Category from '@/models/Category';
import Account from '@/models/Account';
import Transaction from '@/models/Transaction';
import Budget from '@/models/Budget';
import RecurringTransaction from '@/models/RecurringTransaction';
import SavingsGoal from '@/models/SavingsGoal';
import Loan from '@/models/Loan';
import { signToken } from '@/lib/auth';
import { toPlain } from '@/lib/serialize';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken({ userId: user._id.toString(), email: user.email });

    // Fetch all user data
    const [accounts, categories, transactions, budgets, recurring, goals, loans] = await Promise.all([
      Account.find({ user_id: user._id }).sort({ name: 1 }),
      Category.find({ user_id: user._id }).sort({ name: 1 }),
      Transaction.find({ user_id: user._id }).sort({ date: -1 }),
      Budget.find({ user_id: user._id }),
      RecurringTransaction.find({ user_id: user._id }),
      SavingsGoal.find({ user_id: user._id }),
      Loan.find({ user_id: user._id }),
    ]);

    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        full_name: user.full_name,
        preferred_currency: user.preferred_currency,
        date_format: user.date_format,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      data: {
        accounts: accounts.map(toPlain),
        categories: categories.map(toPlain),
        transactions: transactions.map(toPlain),
        budgets: budgets.map(toPlain),
        recurring: recurring.map(toPlain),
        goals: goals.map(toPlain),
        loans: loans.map(toPlain),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
