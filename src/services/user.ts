import { Response, NextFunction } from "express";
import { BaseRepository } from "../repositories/baseRepository";
import { User, UserDocument } from "../models/user";
import { NotFoundException, UnauthorizedException } from "../utils/exceptions";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { WalletService } from "./wallet";
import mongoose from "mongoose";

export class UserService extends BaseRepository<UserDocument> {
  private walletService: WalletService;

  constructor() {
    super(User);
    this.walletService = new WalletService();
  }

  async getUserInfo(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      
      if (!req.user?.id) {
        return next(new UnauthorizedException("Unauthorized"));
      }

      const userId = new mongoose.Types.ObjectId(req.user.id);

      
      const user = await this.findById(userId);
      if (!user) {
        throw new NotFoundException("User not found");
      }

      
      const wallet = await this.walletService.getWalletByUserId(userId);
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
            ledgerBalance: wallet.ledgerBalance,
            availableBalance: wallet.availableBalance,
            currency: wallet.currency,
          },
          lastLoginAttempt: user.lastLoginAttempt,
          lastLoginAttemptSuccessful: user.lastLoginAttemptSuccessful,
          lastLoginTimestamp: user.lastLoginTimestamp,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
