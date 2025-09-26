import { SystemSettingRepository } from '../repositories/systemSettings';
import { ISystemSetting } from '../models/systemSettings';

export class SystemSettingUseCase {
  private repository: SystemSettingRepository;

  constructor() {
    this.repository = new SystemSettingRepository();
  }

  
  async getSettings(): Promise<ISystemSetting> {
    let settings = await this.repository.findSettings();

    if (!settings) {
      settings = await this.repository.createDefaultSettings();
    }

    return settings;
  }

  
  async updateSettings(update: Partial<ISystemSetting>): Promise<ISystemSetting | null> {
    return await this.repository.updateSettings(update);
  }
}
