import { SystemSetting, ISystemSetting } from '../models/systemSettings';

export class SystemSettingRepository {
  
  async findSettings(): Promise<ISystemSetting | null> {
    return await SystemSetting.findOne();
  }

  async createDefaultSettings(): Promise<ISystemSetting> {
    const defaultSettings: Partial<ISystemSetting> = {
      failedLoginMaxAttempts: 5,
      accountLockDurationMinutes: 15,
      withdrawalMinAmount: 100,
      withdrawalMaxAmount: 100000,
      providers: {
        paystack: true,
        flutterwave: true,
      },
    };

    const settings = new SystemSetting(defaultSettings);
    return await settings.save();
  }

  async updateSettings(
    update: Partial<ISystemSetting>
  ): Promise<ISystemSetting | null> {
    return await SystemSetting.findOneAndUpdate({}, update, { new: true });
  }
}
