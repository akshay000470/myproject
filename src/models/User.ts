import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  full_name: string | null;
  avatar_url: string | null;
  preferred_currency: string;
  date_format: string;
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  full_name: { type: String, default: null },
  avatar_url: { type: String, default: null },
  preferred_currency: { type: String, default: 'INR' },
  date_format: { type: String, default: 'DD/MM/YYYY' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
