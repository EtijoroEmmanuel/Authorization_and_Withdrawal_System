import { SystemSettingRepository } from "../repositories/systemSettings";
import { SystemSettingType } from "../models/systemSettings";

export class SystemSettingService {
  private repository: SystemSettingRepository;

  constructor() {
    this.repository = new SystemSettingRepository();
  }

  async getSettings(): Promise<SystemSettingType> {
    let settings = await this.repository.findSettings();

    if (!settings) {
      settings = await this.repository.createDefaultSettings();
    }

    return settings;
  }

  async updateSettings(
    update: Partial<SystemSettingType>
  ): Promise<SystemSettingType | null> {
    return await this.repository.updateSettings(update);
  }
}
