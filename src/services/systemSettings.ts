import { SystemSettingRepository } from "../repositories/systemSettings";
import { SystemSettingType } from "../models/systemSettings";

export class SystemSettingService {
  private repository: SystemSettingRepository;

  constructor() {
    this.repository = new SystemSettingRepository();
  }

  async getSettings(): Promise<SystemSettingType> {
    return await this.repository.getSettings();
  }

  async updateSettings(
    update: Partial<SystemSettingType>
  ): Promise<SystemSettingType> {
    return await this.repository.updateSettings(update);
  }
}
