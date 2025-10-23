import Redis from "ioredis";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export const redisClient = new Redis(env.REDIS_URL);

redisClient.on("connect", () => {
  logger.info("Connected to Redis");
});

redisClient.on("error", (err) => {
  logger.error({ err }, "Redis error");
});
