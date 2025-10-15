import { SystemSetting, SystemSettingType } from "../models/systemSettings";
import { BaseRepository } from "./baseRepository";
import { NotFoundException } from "../utils/exceptions";

export class SystemSettingRepository extends BaseRepository<SystemSettingType> {
  constructor() {
    super(SystemSetting);
  }

  async findSettings(): Promise<SystemSettingType> {
    const settings = await this.findOne({});
    if (!settings) {
      throw new NotFoundException("System settings not found");
    }

    const defaultSettings: Partial<SystemSettingType> = {
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
    };

    return { ...defaultSettings, ...settings };
  }

  async updateSettings(
    update: Partial<SystemSettingType>
  ): Promise<SystemSettingType> {
    const updatedSettings = await this.findOneAndUpdate({}, update, {
      new: true,
      upsert: true,
    });
    if (!updatedSettings) {
      throw new NotFoundException("System settings not found");
    }

    return updatedSettings;
  }
}
