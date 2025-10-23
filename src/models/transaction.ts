import { Schema, model, Types, Document } from "mongoose";

export enum TransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REVERSED = "REVERSED",
}

export interface ITransaction extends Document {
  user: Types.ObjectId;
  wallet: Types.ObjectId;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  reference: string;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    wallet: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      required: true,
      default: TransactionStatus.PENDING,
    },
    reference: { type: String, required: true, unique: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    currency: { type: String, required: true, default: "NGN" },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
