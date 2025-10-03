import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middlewares/async";
import { UserService } from "../services/user";
import ErrorResponse from "../utils/errorResponse";

const userService = new UserService();

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fullName, email, password } = req.body;

    const user = await userService.register(fullName, email, password);

    res.status(201).json({
      success: true,
      data: user,
    });
  }
);

export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

   
    const result = await userService.login(email, password);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

export const getUserInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const reqUser = req as unknown as Express.Request & {
      user: { id: string; role: "user" | "admin" };
    };

   if (!reqUser.user) {
      return next(new ErrorResponse("Unauthorized", 401));
    }

    const user = await userService.getUserInfo(reqUser.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);
