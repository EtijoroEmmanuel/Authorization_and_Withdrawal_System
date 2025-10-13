import { UserRepository } from "../repositories/user";
import { NotFoundException } from "../utils/exceptions";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserInfo(userId: string) {
    const user = await this.userRepository.findById(userId);
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
}
