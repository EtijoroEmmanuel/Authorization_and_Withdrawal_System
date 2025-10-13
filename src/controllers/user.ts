import { Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async";
import { UserService } from "../services/user";
import { UnauthorizedException } from "../utils/exceptions";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

const userService = new UserService();

export const getUserInfo = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      return next(new UnauthorizedException("Unauthorized"));
    }

    const user = await userService.getUserInfo(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);
