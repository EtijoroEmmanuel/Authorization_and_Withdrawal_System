import mongoose from "mongoose";
import { Response, NextFunction } from "express";
import {
  TransactionDocument,
  TransactionType,
  TransactionStatus,
} from "../models/transaction";
import { transactionRepository } from "../repositories/transaction";
import { User } from "../models/user";
import { Wallet, WalletDocument } from "../models/wallet";
import { NotFoundException, BadRequestException } from "../utils/exceptions";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export class TransactionService {
  private async createTransaction(
    params: {
      user: mongoose.Types.ObjectId;
      wallet: mongoose.Types.ObjectId;
      amount: number;
      type: TransactionType;
      balanceBefore: number;
      balanceAfter: number;
      currency?: string;
      meta?: Record<string, any>;
    },
    session?: mongoose.ClientSession
  ): Promise<TransactionDocument> {
    const reference = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return transactionRepository.create(
      {
        ...params,
        reference,
        status: TransactionStatus.SUCCESS,
        currency: params.currency || "NGN",
      },
      session
    );
  }

  
  async creditUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.user?.id;
    const { amount, meta } = req.body;

    if (!amount || amount <= 0)
      return next(new BadRequestException("Amount must be greater than 0"));

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) throw new NotFoundException("User not found");

      if (!user.wallet) throw new NotFoundException("User wallet not found");

      const wallet = await Wallet.findById(user.wallet).session(session);
      if (!wallet) throw new NotFoundException("Wallet not found");

      const balanceBefore = wallet.availableBalance;

      wallet.availableBalance += amount;
      wallet.ledgerBalance += amount;
      await wallet.save({ session });

      const transaction = await this.createTransaction(
        {
          user: user._id,
          wallet: wallet._id,
          amount,
          type: TransactionType.CREDIT,
          balanceBefore,
          balanceAfter: wallet.availableBalance,
          currency: wallet.currency,
          meta,
        },
        session
      );

      await session.commitTransaction();

      return res.status(200).json({
        success: true,
        message: "Wallet credited successfully",
        data: transaction,
      });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  }

  
  async getUserTransactions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      const transactions = await transactionRepository.find({ user: userId });
      if (!transactions || transactions.length === 0)
        throw new NotFoundException("No transactions found");

      return res.status(200).json({
        success: true,
        message: "User transactions retrieved successfully",
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

 
  async getTransactionById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const transaction = await transactionRepository.findById(id);
      if (!transaction) throw new NotFoundException("Transaction not found");

      return res.status(200).json({
        success: true,
        message: "Transaction retrieved successfully",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

 
  async getAccountBalances(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;

      const wallet: WalletDocument | null = await Wallet.findOne({ user: userId });
      if (!wallet) throw new NotFoundException("Wallet not found");

      return res.status(200).json({
        success: true,
        message: "Account balances retrieved successfully",
        data: {
          ledgerBalance: wallet.ledgerBalance,
          availableBalance: wallet.availableBalance,
          currency: wallet.currency,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const transactionService = new TransactionService();
