import mongoose from "mongoose";
import { SystemSetting } from "../models/systemSettings";
import { env } from "../config/env";
import { logger } from "../utils/logger";

async function seedSystemSettings() {
  try {
    await mongoose.connect(env.DB.URL);
    logger.info("Connected to MongoDB");

    const existing = await SystemSetting.findOne();
    if (existing) {
      logger.info("SystemSettings already exist. Skipping seeding.");
      await mongoose.connection.close();
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
    logger.info("Default SystemSettings seeded successfully");

    await mongoose.connection.close();
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    logger.error(`Error seeding system settings: ${errorMessage}`);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedSystemSettings();
