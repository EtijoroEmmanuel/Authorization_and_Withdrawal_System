import { SystemSetting, SystemSettingType } from "../models/systemSettings";

export class SystemSettingRepository {
  async findSettings(): Promise<SystemSettingType | null> {
    return await SystemSetting.findOne();
  }

  async createDefaultSettings(): Promise<SystemSettingType> {
    const defaultSettings: Partial<SystemSettingType> = {
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
    };

    const settings = new SystemSetting(defaultSettings);
    return await settings.save();
  }

  async updateSettings(
    update: Partial<SystemSettingType>
  ): Promise<SystemSettingType | null> {
    return await SystemSetting.findOneAndUpdate({}, update, { new: true });
  }
}
