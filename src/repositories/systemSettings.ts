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
    return settings;
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
      paymentProviders: {
        paystack: true,
        flutterwave: true,
      },
    };

    return this.create(defaultSettings);
  }

  async updateSettings(
    update: Partial<SystemSettingType>
  ): Promise<SystemSettingType> {
    const updated = await this.findOneAndUpdate({}, update);
    if (!updated) {
      throw new NotFoundException("System settings not found to update");
    }
    return updated;
  }
}
