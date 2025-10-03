import mongoose from "mongoose";
import { SystemSetting } from "../models/systemSettings";
import { env } from "../config/env";

async function seedSystemSettings() {
  try {
    await mongoose.connect(env.DB.URL);

    console.log("Connected to MongoDB");

    await SystemSetting.deleteMany({});
    console.log("Cleared existing SystemSettings");

    const defaultSettings = new SystemSetting({
      loginSettingsMeta: {
        failedLoginMaxAttempts: 5,
        accountLockDurationMinutes: 15,
      },
      withdrawalSettings: {
        minAmount: 100,
        maxAmount: 100000,
      },
      providers: {
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
