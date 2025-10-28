import { Router } from "express";
import { WalletService } from "../services/wallet";
import { userAuth, AuthenticatedRequest } from "../middlewares/authMiddleware";
import { Types } from "mongoose";

const router = Router();
const walletService = new WalletService();

router.get(
  "/wallet",
  userAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.user?.id) throw new Error("Unauthorized");

      const userId = new Types.ObjectId(req.user.id);
      const wallet = await walletService.getWalletByUserId(userId);

      res.status(200).json({
        success: true,
        data: {
          ledger: wallet.ledger,
          available: wallet.available,
          currency: wallet.currency,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
