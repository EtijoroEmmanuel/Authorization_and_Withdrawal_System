import { Request, Response, NextFunction, RequestHandler } from "express";
import { JWTUtil } from "../utils/jwt";
import { UnauthorizedException } from "../utils/exceptions";
import { User, UserRole } from "../models/user";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export const protect = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = JWTUtil.extractTokenFromHeader(req.headers.authorization);
    }

    if (!token) {
      throw new UnauthorizedException(
        "You are not logged in. Please log in to continue."
      );
    }

    const decoded = JWTUtil.verifyToken(token);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedException(
        "The user belonging to this token no longer exists."
      );
    }

    req.user = {
      id: user._id.toString(),
      role: user.role as UserRole,
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
