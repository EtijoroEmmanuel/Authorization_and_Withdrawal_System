import { Schema, model, Types, InferSchemaType, Document } from "mongoose";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 4 },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isLocked: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    wallet: { type: Schema.Types.ObjectId, ref: "Wallet", default: null },
    lastLoginAttempt: { type: Date, default: null },
    lastLoginAttemptSuccessful: { type: Boolean, default: false },
    lastLoginTimestamp: { type: Date, default: null },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema> &
  Document & {
    _id: Types.ObjectId;
  };

export const User = model<UserDocument>("User", userSchema);
