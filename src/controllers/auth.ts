import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async";
import { AuthService } from "../services/authUser";
import ErrorResponse from "../utils/errorResponse";

const authService = new AuthService();

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fullName, email, password } = req.body;

    const user = await authService.register(fullName, email, password);

    res.status(201).json({
      success: true,
      data: user,
    });
  }
);

export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);
