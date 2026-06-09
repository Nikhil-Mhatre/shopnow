import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  role: "customer" | "admin";
  firstName?: string;
  lastName?: string;
  phone?: string;
  savedAddresses: {
    isDefault: boolean;
    label: string;
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    // Profile Data Fields (Populated Just-In-Time)
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    savedAddresses: [
      {
        isDefault: { type: Boolean, default: false }, // Manages default checkout address
        label: { type: String, default: "Home" },
        fullName: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

export const UserModel = model<IUser>("User", UserSchema);
