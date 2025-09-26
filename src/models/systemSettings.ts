import { Schema, model, Document } from 'mongoose';

export interface ISystemSetting extends Document {
  failedLoginMaxAttempts: number;
  accountLockDurationMinutes: number;
  withdrawalMinAmount: number;
  withdrawalMaxAmount: number; 
  providers?: {
    paystack: boolean;
    flutterwave: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const systemSettingSchema = new Schema<ISystemSetting>(
  {
    failedLoginMaxAttempts: {
      type: Number,
      required: true,
      default: 5,
    },
    accountLockDurationMinutes: {
      type: Number,
      required: true,
      default: 15,
    },
    withdrawalMinAmount: {
      type: Number,
      default: 100,
    },
    withdrawalMaxAmount: {
      type: Number,
      default: 100000,
    },
    providers: {
      paystack: { type: Boolean, default: true },
      flutterwave: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const SystemSetting = model<ISystemSetting>(
  'SystemSetting',
  systemSettingSchema
);
