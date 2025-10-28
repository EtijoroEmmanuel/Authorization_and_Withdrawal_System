import { Response, NextFunction } from "express";
import { BaseRepository } from "../repositories/baseRepository";
import { User, UserDocument } from "../models/user";
import { Wallet, WalletDocument } from "../models/wallet";
import { NotFoundException, UnauthorizedException } from "../utils/exceptions";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export class UserService {
  private repository: BaseRepository<UserDocument>;

  constructor() {
    this.repository = new BaseRepository<UserDocument>(User);
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

    const wallet: WalletDocument | null = await Wallet.findOne({
      user: user._id,
    });
    if (!wallet) {
      throw new NotFoundException("User wallet not found");
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        balance: {
          ledger: wallet.ledger,
          available: wallet.available,
          currency: wallet.currency,
        },
        lastLoginAttempt: user.lastLoginAttempt,
        lastLoginAttemptSuccessful: user.lastLoginAttemptSuccessful,
        lastLoginTimestamp: user.lastLoginTimestamp,
      },
    });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.repository.findOne({ email });
  }
}
