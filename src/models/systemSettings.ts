import { Schema, model, InferSchemaType } from "mongoose";

const loginSettingsSchema = new Schema(
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
  },
  { _id: false }
);


const withdrawalSettingsSchema = new Schema(
  {
    minAmount: {
      type: Number,
      default: 100,
    },
    maxAmount: {
      type: Number,
      default: 100000,
    },
  },
  { _id: false }
);

const systemSettingSchema = new Schema(
  {
    loginSettingsMeta: loginSettingsSchema,
    withdrawalSettings: withdrawalSettingsSchema,
    providers: {
      paystack: { type: Boolean, default: true },
      flutterwave: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export type SystemSettingType = InferSchemaType<typeof systemSettingSchema>;

export const SystemSetting = model<SystemSettingType>(
  "SystemSetting",
  systemSettingSchema
);
