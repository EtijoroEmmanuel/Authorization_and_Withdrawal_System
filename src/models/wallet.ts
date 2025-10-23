import { Schema, model, Types, InferSchemaType, Document } from "mongoose";

export interface IWallet extends Document {
  user: Types.ObjectId;
  ledger: number;
  available: number;
  currency: string;
}

const walletSchema = new Schema<IWallet>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ledger: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    currency: { type: String, default: "NGN" },
  },
  { timestamps: true }
);

export const Wallet = model<IWallet>("Wallet", walletSchema);
