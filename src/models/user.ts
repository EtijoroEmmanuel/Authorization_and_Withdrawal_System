import { Schema, model, InferSchemaType } from "mongoose";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    balance: {
      ledger: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export type UserType = InferSchemaType<typeof userSchema> & { _id: string };

export const User = model<UserType>("User", userSchema);
