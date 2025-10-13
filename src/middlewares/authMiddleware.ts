import { Request, RequestHandler } from "express";
import { JWTUtil } from "../utils/jwt";
import { UnauthorizedException } from "../utils/exceptions";
import { UserRole } from "../models/user";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export const userAuth: RequestHandler = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Invalid or missing Authorization header"
      );
    }

    const token = JWTUtil.extractTokenFromHeader(authHeader);
    const decoded = JWTUtil.verifyToken(token);

    (req as AuthenticatedRequest).user = {
      id: decoded.userId,
      role: decoded.role as UserRole,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const authorizeRole =
  (roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user || !roles.includes(user.role)) {
      throw new UnauthorizedException("Insufficient permissions");
    }
    next();
  };
