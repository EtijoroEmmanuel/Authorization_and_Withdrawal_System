import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import ErrorResponse from "../utils/errorResponse";

interface TokenPayload {
  userId: string;
  role: "user" | "admin";
}

export class JWTUtil {
  private static JWT_SECRET = env.AUTH?.JWT_SECRET || process.env.JWT_SECRET;
  private static JWT_EXPIRES = env.AUTH?.JWT_EXPIRES || process.env.JWT_EXPIRES;

  /**
   * Generates a JWT token
   * @param payload TokenPayload
   * @returns JWT string
   */
  static generateToken(payload: TokenPayload): string {
    if (!this.JWT_SECRET) {
      throw new ErrorResponse(
        "JWT_SECRET is not defined in environment variables",
        500
      );
    }

    if (!this.JWT_EXPIRES) {
      throw new ErrorResponse(
        "JWT_EXPIRES is not defined properly in environment variables",
        500
      );
    }

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES as jwt.SignOptions["expiresIn"],
    });
  }

 
  static verifyToken(token: string): TokenPayload {
    try {
      if (!this.JWT_SECRET) {
        throw new ErrorResponse(
          "JWT_SECRET is not defined in environment variables",
          500
        );
      }

      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new ErrorResponse("Token has expired", 401);
      }
      if (error.name === "JsonWebTokenError") {
        throw new ErrorResponse("Invalid token", 401);
      }
      throw error;
    }
  }

  
  static extractTokenFromHeader(authHeader: string | undefined): string {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ErrorResponse("No token provided or invalid format", 401);
    }
    return authHeader.split(" ")[1];
  }

  static isTokenAboutToExpire(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JwtPayload | null;
      if (!decoded || !decoded.exp) return true;

      const expirationTime = decoded.exp * 1000; // seconds → ms
      const oneHourFromNow = Date.now() + 60 * 60 * 1000;

      return expirationTime < oneHourFromNow;
    } catch {
      return true;
    }
  }
}
