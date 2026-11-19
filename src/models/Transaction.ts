import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  account_id: mongoose.Types.ObjectId;
  destination_account_id?: mongoose.Types.ObjectId | null;
  category_id?: mongoose.Types.ObjectId | null;
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date: string;
  payment_method: string;
  description?: string | null;
  attachment_url?: string | null;
  created_at: Date;
  updated_at: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  account_id: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  destination_account_id: { type: Schema.Types.ObjectId, ref: 'Account', default: null },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
  date: { type: String, required: true },
  payment_method: { type: String, required: true },
  description: { type: String, default: null },
  attachment_url: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
