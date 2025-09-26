import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middlewares/async";
import { UserUseCase } from "../usecases/user";
import ErrorResponse from "../utils/errorResponse";

const userUseCase = new UserUseCase();

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return next(new ErrorResponse("Missing required fields", 400));
    }

    const user = await userUseCase.register(fullName, email, password);

    res.status(201).json({
      success: true,
      data: user,
    });
  }
);

export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorResponse("Missing email or password", 400));
    }

    const result = await userUseCase.login(email, password);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);


export const getUserInfo = asyncHandler(
  async (req, res, next) => {
    
    const reqUser = req as unknown as Express.Request & { user: { id: string; role: "user" | "admin" } };

    if (!reqUser.user || !reqUser.user.id) {
      return next(new ErrorResponse("Unauthorized", 401));
    }

    const user = await userUseCase.getUserInfo(reqUser.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);


