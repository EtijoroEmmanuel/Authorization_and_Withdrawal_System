import { Response, NextFunction } from "express";
import { BaseRepository } from "../repositories/baseRepository";
import { User, UserType } from "../models/user";
import { NotFoundException, UnauthorizedException } from "../utils/exceptions";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export class UserService {
  private repository: BaseRepository<UserType>;

  constructor() {
    this.repository = new BaseRepository<UserType>(User);
  }

  async getUserInfo(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    if (!req.user?.id) {
      return next(new UnauthorizedException("Unauthorized"));
    }

    const user = await this.repository.findById(req.user.id);
    if (!user) throw new NotFoundException("User not found");

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        balance: user.balance,
        lastLoginAttempt: user.lastLoginAttempt,
        lastLoginAttemptSuccessful: user.lastLoginAttemptSuccessful,
        lastLoginTimestamp: user.lastLoginTimestamp,
      },
    });
  }

  async findByEmail(email: string): Promise<UserType | null> {
    return await this.repository.findOne({ email });
  }

  async createUser(data: Partial<UserType>): Promise<UserType> {
    return await User.create(data);
  }
}
