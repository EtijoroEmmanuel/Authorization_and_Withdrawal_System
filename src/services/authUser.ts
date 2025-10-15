import bcrypt from "bcrypt";
import { UserService } from "./user";
import { SystemSettingService } from "./systemSettings";
import { JWTUtil } from "../utils/jwt";
import { env } from "../config/env";
import { redisClient } from "../utils/redis";
import { formatDate } from "../utils/date";
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from "../utils/exceptions";
import { UserRole } from "../models/user";

export class AuthService {
  private userService: UserService;
  private systemSettingService: SystemSettingService;

  constructor() {
    this.userService = new UserService();
    this.systemSettingService = new SystemSettingService();
  }

  async register(fullName: string, email: string, password: string) {
    const dbEmail = email.toLowerCase();

    const existingUser = await this.userService.findByEmail(dbEmail);
    if (existingUser) throw new BadRequestException("Email already in use");

    const salt = await bcrypt.genSalt(env.AUTH.BCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userService.createUser({
      fullName,
      email: dbEmail,
      password: hashedPassword,
      role: UserRole.USER,
      isLocked: false,
      failedLoginAttempts: 0,
      balance: { ledger: 0, available: 0 },
      lastLoginAttempt: null,
      lastLoginAttemptSuccessful: false,
      lastLoginTimestamp: null,
    });

    return {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    };
  }

  async login(email: string, password: string) {
    const dbEmail = email.toLowerCase();
    const user = await this.userService.findByEmail(dbEmail);
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
      const remaining = Math.ceil((Number(lockUntilStr) - Date.now()) / 60000);
      throw new ForbiddenException(
        `Account locked. Try again in ${remaining} minutes.`
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const failedAttempts = (user.failedLoginAttempts ?? 0) + 1;

      await this.userService.updateUser(user._id.toString(), {
        failedLoginAttempts: failedAttempts,
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

        await this.userService.updateUser(user._id.toString(), {
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

    await this.userService.updateUser(user._id.toString(), {
      failedLoginAttempts: 0,
      isLocked: false,
      lockUntil: null,
      lastLoginAttempt: new Date(),
      lastLoginAttemptSuccessful: true,
      lastLoginTimestamp: new Date(),
    });

    await redisClient.del(attemptsKey);
    await redisClient.del(lockKey);

    const token = JWTUtil.generateToken({ userId: user._id, role: user.role });

    return {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        lastLoginAttempt: formatDate(user.lastLoginAttempt),
        lastLoginAttemptSuccessful: user.lastLoginAttemptSuccessful,
        lastLoginTimestamp: formatDate(user.lastLoginTimestamp),
      },
    };
  }
}
