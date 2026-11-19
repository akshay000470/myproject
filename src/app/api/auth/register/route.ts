import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Category from '@/models/Category';
import { signToken } from '@/lib/auth';

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#174D3C', is_default: true },
  { name: 'Transportation', type: 'expense', icon: 'car', color: '#2D5A47', is_default: true },
  { name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#B69B62', is_default: true },
  { name: 'Entertainment', type: 'expense', icon: 'film', color: '#5A6B5C', is_default: true },
  { name: 'Education', type: 'expense', icon: 'book-open', color: '#3A6351', is_default: true },
  { name: 'Healthcare', type: 'expense', icon: 'heart-pulse', color: '#C65C54', is_default: true },
  { name: 'Housing & Rent', type: 'expense', icon: 'home', color: '#174D3C', is_default: true },
  { name: 'Utilities & Bills', type: 'expense', icon: 'zap', color: '#8C7A4E', is_default: true },
  { name: 'Subscriptions', type: 'expense', icon: 'repeat', color: '#657766', is_default: true },
  { name: 'Travel', type: 'expense', icon: 'plane', color: '#2B4A3E', is_default: true },
  { name: 'Other Expense', type: 'expense', icon: 'tag', color: '#777B76', is_default: true },
  { name: 'Salary', type: 'income', icon: 'briefcase', color: '#174D3C', is_default: true },
  { name: 'Freelance', type: 'income', icon: 'laptop', color: '#2D5A47', is_default: true },
  { name: 'Investments', type: 'income', icon: 'trending-up', color: '#B69B62', is_default: true },
  { name: 'Dividends', type: 'income', icon: 'pie-chart', color: '#3A6351', is_default: true },
  { name: 'Other Income', type: 'income', icon: 'plus-circle', color: '#777B76', is_default: true },
];

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password, full_name } = await req.json();

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      full_name,
    });

    // Seed default categories
    await Category.insertMany(
      DEFAULT_CATEGORIES.map(cat => ({ ...cat, user_id: user._id }))
    );

    const token = signToken({ userId: user._id.toString(), email: user.email });

    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        full_name: user.full_name,
        preferred_currency: user.preferred_currency,
        date_format: user.date_format,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
