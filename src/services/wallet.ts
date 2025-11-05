import { Response, NextFunction } from "express";
import { WalletRepository } from "../repositories/wallet";
import { WalletDocument } from "../models/wallet";
import { NotFoundException, UnauthorizedException } from "../utils/exceptions";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { Types } from "mongoose";

export class WalletService {
  private walletRepository: WalletRepository;

  constructor() {
    this.walletRepository = new WalletRepository();
  }

  async createWallet(
    data: Partial<WalletDocument>,
    session?: any
  ): Promise<WalletDocument> {
    return this.walletRepository.create(data, session);
  }

  async getWalletForUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException("Invalid wallet ID");
      }

      const wallet = await this.walletRepository.findById(id);
      if (!wallet) throw new NotFoundException("Wallet not found");

      if (wallet.user.toString() !== req.user?.id) {
        throw new UnauthorizedException(
          "You do not have access to this wallet"
        );
      }

      res.status(200).json({
        success: true,
        message: "Wallet fetched successfully",
        data: {
          id: wallet._id,
          user: wallet.user,
          ledgerBalance: wallet.ledgerBalance,
          availableBalance: wallet.availableBalance,
          currency: wallet.currency,
          createdAt: wallet.createdAt,
          updatedAt: wallet.updatedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getWalletByUserId(userId: Types.ObjectId): Promise<WalletDocument> {
    const wallet = await this.walletRepository.findOne({ user: userId });
    if (!wallet) throw new NotFoundException("Wallet not found");
    return wallet;
  }

  async getWalletById(walletId: string): Promise<WalletDocument> {
    if (!Types.ObjectId.isValid(walletId)) {
      throw new NotFoundException("Invalid wallet ID");
    }
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) throw new NotFoundException("Wallet not found");
    return wallet;
  }
}
