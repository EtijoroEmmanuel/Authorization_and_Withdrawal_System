import { BaseRepository } from "../repositories/baseRepository";
import { User, UserType, CreateUserInput } from "../models/user";
import { NotFoundException } from "../utils/exceptions";

export class UserService {
  private repository: BaseRepository<UserType>;

  constructor() {
    this.repository = new BaseRepository<UserType>(User);
  }

  async getUserInfo(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    return {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      balance: user.balance,
      lastLoginAttempt: user.lastLoginAttempt,
      lastLoginAttemptSuccessful: user.lastLoginAttemptSuccessful,
      lastLoginTimestamp: user.lastLoginTimestamp,
    };
  }

  async findByEmail(email: string): Promise<UserType | null> {
    return await this.repository.findOne({ email });
  }

  async createUser(data: CreateUserInput): Promise<UserType> {
    const user = new User(data);
    return await user.save();
  }

  async updateUser(
    userId: string,
    update: Record<string, unknown>
  ): Promise<UserType | null> {
    return await this.repository.findByIdAndUpdate(userId, update);
  }
}
