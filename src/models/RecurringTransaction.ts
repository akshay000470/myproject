import mongoose, { Schema, Document } from 'mongoose';

export interface IRecurringTransaction extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  account_id: mongoose.Types.ObjectId;
  category_id?: mongoose.Types.ObjectId | null;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  next_due_date: string;
  is_active: boolean;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
}

const RecurringTransactionSchema = new Schema<IRecurringTransaction>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  account_id: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
  start_date: { type: String, required: true },
  next_due_date: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  description: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.RecurringTransaction || mongoose.model<IRecurringTransaction>('RecurringTransaction', RecurringTransactionSchema);
