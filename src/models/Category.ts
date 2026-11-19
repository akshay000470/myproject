import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  is_default: boolean;
  created_at: Date;
}

const CategorySchema = new Schema<ICategory>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  is_default: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
