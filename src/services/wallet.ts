import { WalletRepository } from "../repositories/wallet";
import { WalletDocument } from "../models/wallet";
import { NotFoundException } from "../utils/exceptions";
import { Types } from "mongoose";

export class WalletService {
  private walletRepository: WalletRepository;

  constructor() {
    this.walletRepository = new WalletRepository();
  }

  async getWalletByUserId(userId: Types.ObjectId): Promise<WalletDocument> {
    const wallet = await this.walletRepository.findOne({ user: userId });
    if (!wallet) throw new NotFoundException("Wallet not found");
    return wallet;
  }
}
