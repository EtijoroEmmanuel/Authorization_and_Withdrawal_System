import { Schema, model, Types, InferSchemaType, Document } from "mongoose";
import { User } from "./user";

export enum Currency {
  NGN = "NGN",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
}

const walletSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: User.name,
      required: true,
    },
    ledgerBalance: {
      type: Number,
      default: 0,
    },
    availableBalance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      enum: Object.values(Currency),
      default: Currency.NGN,
      required: true,
    },
  },
  { timestamps: true }
);

export type WalletDocument = InferSchemaType<typeof walletSchema> &
  Document & {
    _id: Types.ObjectId;
  };

export const Wallet = model<WalletDocument>("Wallet", walletSchema);
