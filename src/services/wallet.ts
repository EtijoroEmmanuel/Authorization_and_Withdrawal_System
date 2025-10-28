import { Wallet, WalletDocument } from "../models/wallet";
import { NotFoundException } from "../utils/exceptions";
import { Types } from "mongoose";

export class WalletService {
  async getWalletByUserId(userId: Types.ObjectId): Promise<WalletDocument> {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) throw new NotFoundException("Wallet not found");
    return wallet;
  }
}
