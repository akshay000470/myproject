import mongoose, { Schema, Document } from 'mongoose';

export interface IAccount extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  name: string;
  type: 'savings' | 'current' | 'cash' | 'credit_card' | 'other';
  balance: number;
  currency: string;
  color: string;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

const AccountSchema = new Schema<IAccount>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['savings', 'current', 'cash', 'credit_card', 'other'], required: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  color: { type: String, default: '#174D3C' },
  is_archived: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);
