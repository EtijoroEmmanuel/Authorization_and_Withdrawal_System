import Redis from "ioredis";
import { env } from "../config/env";

const redisUrl = env.REDIS_URL || "redis://localhost:6379";

export const redisClient = new Redis(redisUrl);

redisClient.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});
