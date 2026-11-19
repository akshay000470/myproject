import mongoose, { Schema, Document } from 'mongoose';

export interface ISavingsGoal extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  description?: string | null;
  status: 'in_progress' | 'completed';
  created_at: Date;
  updated_at: Date;
}

const SavingsGoalSchema = new Schema<ISavingsGoal>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  target_amount: { type: Number, required: true },
  current_amount: { type: Number, default: 0 },
  target_date: { type: String, default: null },
  description: { type: String, default: null },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.SavingsGoal || mongoose.model<ISavingsGoal>('SavingsGoal', SavingsGoalSchema);
