import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { UserService } from "../services/user";
import { asyncHandler } from "../middlewares/async";

const router = Router();
const userService = new UserService();

router.get(
  "/info",
  protect,
  asyncHandler(userService.getUserInfo.bind(userService))
);

export default router;
