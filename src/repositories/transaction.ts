import { BaseRepository } from "./baseRepository";
import { Transaction, TransactionDocument } from "../models/transaction";

export class TransactionRepository extends BaseRepository<TransactionDocument> {
  constructor() {
    super(Transaction);
  }
}

export const transactionRepository = new TransactionRepository();
