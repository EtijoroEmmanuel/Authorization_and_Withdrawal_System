import bcrypt from "bcrypt";
import UserRepository from "../repositories/user";
import { SystemSettingService } from "./systemSettings";
import { JWTUtil } from "../utils/jwt";
import { env } from "../config/env";
import { redisClient } from "../utils/redis";
import ErrorResponse from "../utils/errorResponse";
import { UserRole, UserType } from "../models/user";

export class UserService {
  private userRepository: UserRepository;
  private systemSettingService: SystemSettingService;

  constructor() {
    this.userRepository = new UserRepository();
    this.systemSettingService = new SystemSettingService();
  }

  async register(fullName: string, email: string, password: string) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) throw new ErrorResponse("Email already in use", 400);

    const salt = await bcrypt.genSalt(env.AUTH.BCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userRepository.createUser({
      fullName,
      email,
      password: hashedPassword,
      role: UserRole.USER,
      isLocked: false,
      failedLoginAttempts: 0,
      balance: { ledger: 0, available: 0 },
    });

    return {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new ErrorResponse("Invalid credentials", 401);

    const settings = await this.systemSettingService.getSettings();
    if (!settings?.loginSettingsMeta) {
      throw new ErrorResponse("Login settings not configured", 500);
    }

    const MAX_FAILED_ATTEMPTS = settings.loginSettingsMeta.failedLoginMaxAttempts;
    const LOCK_TIME_MINUTES = settings.loginSettingsMeta.accountLockDurationMinutes;

    const attemptsKey = `login_attempts:${user._id}`;
    const lockKey = `lock_until:${user._id}`;

    const lockUntilStr = await redisClient.get(lockKey);
    if (lockUntilStr) {
      const lockUntil = Number(lockUntilStr);
      if (lockUntil > Date.now()) {
        const remaining = Math.ceil((lockUntil - Date.now()) / 60000);
        throw new ErrorResponse(`Account is locked. Try again in ${remaining} minutes.`, 403);
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      let attemptsStr = await redisClient.get(attemptsKey);
      let attempts = attemptsStr ? Number(attemptsStr) : 0;
      attempts += 1;

      await redisClient.set(attemptsKey, attempts.toString(), "EX", LOCK_TIME_MINUTES * 60);

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        const lockUntil = Date.now() + LOCK_TIME_MINUTES * 60 * 1000;
        await redisClient.set(lockKey, lockUntil.toString(), "EX", LOCK_TIME_MINUTES * 60);
      }

      throw new ErrorResponse("Invalid credentials", 401);
    }

    await redisClient.del(attemptsKey);
    await redisClient.del(lockKey);

    const token = JWTUtil.generateToken({ userId: user._id, role: user.role });

    return {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    };
  }

  async getUserInfo(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new ErrorResponse("User not found", 404);

    return {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      balance: user.balance,
    };
  }
}
