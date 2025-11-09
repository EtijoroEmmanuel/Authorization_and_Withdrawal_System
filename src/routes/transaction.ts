import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/async";
import { TransactionService } from "../services/transaction";

const router = Router();
const transactionService = new TransactionService();

router.post(
  "/credit",
  protect,
  asyncHandler(transactionService.creditUser.bind(transactionService))
);

router.get(
  "/",
  protect,
  asyncHandler(transactionService.getUserTransactions.bind(transactionService))
);

router.get(
  "/:id",
  protect,
  asyncHandler(transactionService.getTransactionById.bind(transactionService))
);

router.get(
  "/balances",
  protect,
  asyncHandler(transactionService.getAccountBalances.bind(transactionService))
);

export default router;
