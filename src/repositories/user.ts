import { User, UserType } from "../models/user";

export default class UserRepository {
  async createUser(data: Partial<UserType>): Promise<UserType> {
    const user = new User(data);
    return await user.save();
  }

  async findByEmail(email: string): Promise<UserType | null> {
    return User.findOne({ email });
  }

  async findById(id: string): Promise<UserType | null> {
    return User.findById(id);
  }

  async updateFailedLoginAttempts(id: string, attempts: number): Promise<void> {
    await User.findByIdAndUpdate(id, { failedLoginAttempts: attempts });
  }

  async updateLockStatus(id: string, isLocked: boolean, lockUntil: Date | null = null): Promise<void> {
    await User.findByIdAndUpdate(id, { isLocked, lockUntil });
  }

  async updateLastLogin(id: string): Promise<void> {
    await User.findByIdAndUpdate(id, { updatedAt: new Date() });
  }

  async updateBalance(id: string, ledger: number, available: number): Promise<void> {
    await User.findByIdAndUpdate(id, { balance: { ledger, available } });
  }
}
