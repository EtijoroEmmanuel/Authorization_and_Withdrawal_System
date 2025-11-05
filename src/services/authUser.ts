import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { UserDocument, UserRole } from "../models/user";
import { Wallet } from "../models/wallet";
import { UserService } from "./user";
import { SystemSettingService } from "./systemSettings";
import { JWTUtil } from "../utils/jwt";
import { env } from "../config/env";
import { redisClient } from "../utils/redis";
import { formatDate } from "../utils/date";
import { withMongoTransaction } from "../utils/monoTransaction";
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from "../utils/exceptions";

export class AuthService {
  private userService: UserService;
  private systemSettingService: SystemSettingService;

  constructor() {
    this.userService = new UserService();
    this.systemSettingService = new SystemSettingService();
  }

  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { fullName, email, password } = req.body;
      const dbEmail = email.toLowerCase();

      const existingUser = await this.userService.findOne({ email: dbEmail });
      if (existingUser) throw new ConflictException("Email already in use");

      const salt = await bcrypt.genSalt(env.AUTH.BCRYPT_SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, salt);

      const result = await withMongoTransaction(async (session) => {
        const user: UserDocument = await this.userService.create(
          {
            fullName,
            email: dbEmail,
            password: hashedPassword,
            role: UserRole.USER,
          },
          session
        );

        const wallet = await Wallet.create(
          [
            {
              user: user._id,
              ledgerBalance: 0,
              availableBalance: 0,
              currency: "NGN",
            },
          ],
          { session }
        );

        await this.userService.findByIdAndUpdate(
          user._id.toString(),
          { wallet: wallet[0]._id },
          { session }
        );

        return { user, wallet: wallet[0] };
      });

      res.status(201).json({
        success: true,
        data: {
          id: result.user._id,
          fullName: result.user.fullName,
          email: result.user.email,
          walletId: result.wallet._id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const dbEmail = email.toLowerCase();

      const user: UserDocument | null = await this.userService.findOne({
        email: dbEmail,
      });
      if (!user) throw new UnauthorizedException("Invalid credentials");

      const settings = await this.systemSettingService.getSettings();
      const loginMeta = settings?.loginSettingsMeta;
      if (!loginMeta)
        throw new BadRequestException("Login settings not configured");

      const MAX_FAILED_ATTEMPTS = loginMeta.failedLoginMaxAttempts;
      const LOCK_TIME_MINUTES = loginMeta.accountLockDurationMinutes;

      const attemptsKey = `login_attempts:${user._id}`;
      const lockKey = `lock_until:${user._id}`;

      if (user.isLocked && user.lockUntil && user.lockUntil > new Date()) {
        const remaining = Math.ceil(
          (user.lockUntil.getTime() - Date.now()) / 60000
        );
        throw new ForbiddenException(
          `Account locked. Try again in ${remaining} minutes.`
        );
      }

      const lockUntilStr = await redisClient.get(lockKey);
      if (lockUntilStr && Number(lockUntilStr) > Date.now()) {
        const remaining = Math.ceil(
          (Number(lockUntilStr) - Date.now()) / 60000
        );
        throw new ForbiddenException(
          `Account locked. Try again in ${remaining} minutes.`
        );
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const failedAttempts = (user.failedLoginAttempts ?? 0) + 1;

        await this.userService.findByIdAndUpdate(user._id.toString(), {
          failedLoginAttempts: failedAttempts,
          lastLoginAttempt: new Date(),
          lastLoginAttemptSuccessful: false,
        });

        const attempts = await redisClient.incr(attemptsKey);
        if (attempts === 1) {
          await redisClient.expire(attemptsKey, LOCK_TIME_MINUTES * 60);
        }

        if (
          failedAttempts >= MAX_FAILED_ATTEMPTS ||
          attempts >= MAX_FAILED_ATTEMPTS
        ) {
          const lockUntilDate = new Date(
            Date.now() + LOCK_TIME_MINUTES * 60 * 1000
          );

          await this.userService.findByIdAndUpdate(user._id.toString(), {
            isLocked: true,
            lockUntil: lockUntilDate,
          });

          await redisClient.set(
            lockKey,
            lockUntilDate.getTime().toString(),
            "EX",
            LOCK_TIME_MINUTES * 60
          );

          throw new ForbiddenException(
            "Account locked due to too many failed login attempts."
          );
        }

        throw new UnauthorizedException("Invalid credentials");
      }

      await this.userService.findByIdAndUpdate(user._id.toString(), {
        failedLoginAttempts: 0,
        isLocked: false,
        lockUntil: null,
        lastLoginAttempt: new Date(),
        lastLoginAttemptSuccessful: true,
        lastLoginTimestamp: new Date(),
      });

      await redisClient.del(attemptsKey);
      await redisClient.del(lockKey);

      const token = JWTUtil.generateToken({
        userId: user._id.toString(),
        role: user.role,
      });

      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            lastLoginAttempt: user.lastLoginAttempt
              ? formatDate(user.lastLoginAttempt)
              : null,
            lastLoginAttemptSuccessful: user.lastLoginAttemptSuccessful,
            lastLoginTimestamp: user.lastLoginTimestamp
              ? formatDate(user.lastLoginTimestamp)
              : null,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
