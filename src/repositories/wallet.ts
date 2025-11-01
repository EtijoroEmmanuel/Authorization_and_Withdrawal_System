import { BaseRepository } from "./baseRepository";
import { Wallet, WalletDocument } from "../models/wallet";

export class WalletRepository extends BaseRepository<WalletDocument> {
  constructor() {
    super(Wallet);
  }
}
