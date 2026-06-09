import { Schema, model, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otpHash: string;
  attempts: number;
  canResendAt: Date;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  otpHash: { type: String, required: true },
  attempts: { type: Number, default: 0, required: true },
  canResendAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }
});

export const OtpModel = model<IOtp>('Otp', OtpSchema);