import mongoose from "mongoose";
import { SystemSetting } from "../models/systemSettings";
import { env } from "../config/env";

async function seedSystemSettings() {
  try {
    await mongoose.connect(env.DB.URL);
    console.log("Connected to MongoDB");

    const existing = await SystemSetting.findOne();
    if (existing) {
      console.log("SystemSettings already exist. Skipping seeding.");
      process.exit(0);
    }

    const defaultSettings = new SystemSetting({
      loginSettingsMeta: {
        failedLoginMaxAttempts: 5,
        accountLockDurationMinutes: 15,
      },
      withdrawalSettings: {
        minAmount: 100,
        maxAmount: 100000,
      },
      paymentProviders: {
        paystack: true,
        flutterwave: true,
      },
    });

    await defaultSettings.save();
    console.log("Default SystemSettings seeded successfully");

    process.exit(0);
  } catch (err) {
    console.error("Error seeding system settings:", err);
    process.exit(1);
  }
}

seedSystemSettings();
