import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user";
import { SystemSettingService } from "./systemSettings";
import { JWTUtil } from "../utils/jwt";
import { env } from "../config/env";
import { redisClient } from "../utils/redis";
import ErrorResponse from "../utils/errorResponse";
import { UserRole } from "../models/user";

export class AuthService {
  private userRepository: UserRepository;
  private systemSettingService: SystemSettingService;

  constructor() {
    this.userRepository = new UserRepository();
    this.systemSettingService = new SystemSettingService();
  }

  async register(fullName: string, email: string, password: string) {
    const dbEmail = email.toLowerCase();

    const existingUser = await this.userRepository.findByEmail(dbEmail);
    if (existingUser) throw new ErrorResponse("Email already in use", 400);

    const salt = await bcrypt.genSalt(env.AUTH.BCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userRepository.createUser({
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
    const user = await this.userRepository.findByEmail(dbEmail);
    if (!user) throw new ErrorResponse("Invalid credentials", 401);

    const settings = await this.systemSettingService.getSettings();
    const loginMeta = settings?.loginSettingsMeta;
    if (!loginMeta)
      throw new ErrorResponse("Login settings not configured", 500);

    const MAX_FAILED_ATTEMPTS = loginMeta.failedLoginMaxAttempts;
    const LOCK_TIME_MINUTES = loginMeta.accountLockDurationMinutes;

    const attemptsKey = `login_attempts:${user._id}`;
    const lockKey = `lock_until:${user._id}`;

    const lockUntilStr = await redisClient.get(lockKey);
    if (lockUntilStr && Number(lockUntilStr) > Date.now()) {
      const remaining = Math.ceil((Number(lockUntilStr) - Date.now()) / 60000);

      const lockUntilLocal = new Date(Number(lockUntilStr)).toLocaleString(
        "en-NG",
        { timeZone: "Africa/Lagos" }
      );
      throw new ErrorResponse(
        `Account locked. Try again in ${remaining} minutes.`,
        403
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await this.userRepository.update(user._id, {
        failedLoginAttempts: user.failedLoginAttempts + 1,
        lastLoginAttempt: new Date(),
        lastLoginAttemptSuccessful: false,
      });

      let attemptsStr = await redisClient.get(attemptsKey);
      let attempts = attemptsStr ? Number(attemptsStr) : 0;
      attempts += 1;
      await redisClient.set(
        attemptsKey,
        attempts.toString(),
        "EX",
        LOCK_TIME_MINUTES * 60
      );

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        const lockUntil = Date.now() + LOCK_TIME_MINUTES * 60 * 1000;
        await redisClient.set(
          lockKey,
          lockUntil.toString(),
          "EX",
          LOCK_TIME_MINUTES * 60
        );
      }

      throw new ErrorResponse("Invalid credentials", 401);
    }

    await redisClient.del(attemptsKey);
    await redisClient.del(lockKey);

    await this.userRepository.update(user._id, {
      failedLoginAttempts: 0,
      lastLoginAttempt: new Date(),
      lastLoginAttemptSuccessful: true,
      lastLoginTimestamp: new Date(),
    });

    const token = JWTUtil.generateToken({ userId: user._id, role: user.role });

    return {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        lastLoginAttempt: user.lastLoginAttempt,
        lastLoginAttemptSuccessful: user.lastLoginAttemptSuccessful,
        lastLoginTimestamp: user.lastLoginTimestamp,
      },
    };
  }
}
