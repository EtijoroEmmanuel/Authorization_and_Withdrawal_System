import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { WalletService } from "../services/wallet";
import { asyncHandler } from "../middlewares/async";

const router = Router();
const walletService = new WalletService();

router.get(
  "/wallets/:id",
  protect,
  asyncHandler(walletService.getWalletForUser.bind(walletService))
);

export default router;
