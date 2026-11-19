import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  category_id: mongoose.Types.ObjectId;
  amount: number;
  month_year: string;
  created_at: Date;
  updated_at: Date;
}

const BudgetSchema = new Schema<IBudget>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  amount: { type: Number, required: true },
  month_year: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

BudgetSchema.index({ user_id: 1, category_id: 1, month_year: 1 }, { unique: true });

export default mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);
