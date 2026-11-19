import mongoose, { Schema, Document } from 'mongoose';

export interface ILoan extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  type: 'borrowed' | 'lent';
  counterparty_name: string;
  total_amount: number;
  interest_rate: number;
  due_date?: string | null;
  paid_amount: number;
  status: 'active' | 'paid_off' | 'defaulted';
  notes?: string | null;
  created_at: Date;
  updated_at: Date;
}

const LoanSchema = new Schema<ILoan>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['borrowed', 'lent'], required: true },
  counterparty_name: { type: String, required: true },
  total_amount: { type: Number, required: true },
  interest_rate: { type: Number, default: 0 },
  due_date: { type: String, default: null },
  paid_amount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'paid_off', 'defaulted'], default: 'active' },
  notes: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.Loan || mongoose.model<ILoan>('Loan', LoanSchema);
