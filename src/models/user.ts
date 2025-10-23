import { Schema, model, Types, Document } from "mongoose";
import { Wallet } from "./wallet";

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

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  isLocked: boolean;
  failedLoginAttempts: number;
  lockUntil?: Date | null;
  wallet?: Types.ObjectId | null;
  lastLoginAttempt?: Date | null;
  lastLoginAttemptSuccessful?: boolean;
  lastLoginTimestamp?: Date | null;
}

export type UserType = IUser;

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
  isLocked?: boolean;
  failedLoginAttempts?: number;
  lockUntil?: Date | null;
  wallet?: Types.ObjectId | null;
  lastLoginAttemptSuccessful?: boolean;
  lastLoginAttempt?: Date | null;
  lastLoginTimestamp?: Date | null;
}

userSchema.post<IUser>("save", async function (doc) {
  if (!doc.wallet) {
    const wallet = await Wallet.create({
      user: doc._id,
      ledger: 0,
      available: 0,
      currency: "NGN",
    });

    doc.wallet = wallet._id as unknown as Types.ObjectId;
    await doc.save();
  }
});

export const User = model<IUser>("User", userSchema);
