import { User, UserType, CreateUserInput } from "../models/user";
import { BaseRepository } from "./baseRepository";

export class UserRepository extends BaseRepository<UserType> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<UserType | null> {
    return this.findOne({ email });
  }

  async createUser(data: CreateUserInput): Promise<UserType> {
    const user = new User(data);
    return await user.save();
  }

  async incrementFailedLoginAttempts(id: string): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      { $inc: { failedLoginAttempts: 1 } }
    );
  }

  async resetFailedLoginAttempts(id: string): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      { $set: { failedLoginAttempts: 0 } }
    );
  }

  async update(id: string, data: Partial<UserType>): Promise<UserType | null> {
    return this.findByIdAndUpdate(id, data);
  }
}
