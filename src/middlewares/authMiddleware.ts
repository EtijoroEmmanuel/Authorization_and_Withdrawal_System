import { Request, Response, NextFunction } from "express";
import { JWTUtil } from "../utils/jwt";
import ErrorResponse from "../utils/errorResponse";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: "user" | "admin";
  };
}

export const userAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ErrorResponse("No token provided or invalid format", 401);
    }

    const token = JWTUtil.extractTokenFromHeader(authHeader);
    const decoded = JWTUtil.verifyToken(token);

    (req as AuthenticatedRequest).user = {
      id: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    next(err);
  }
};
