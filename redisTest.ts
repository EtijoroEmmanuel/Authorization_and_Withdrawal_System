import { redisClient } from "./src/utils/redis";

async function testRedis() {
  try {
    
    await redisClient.set("testKey", "Hello Redis!", "EX", 60);
    console.log(" Key set successfully");

    const value = await redisClient.get("testKey");
    console.log("Retrieved value:", value);

    await redisClient.quit();
    console.log("Redis connection closed");
  } catch (err) {
    console.error("Redis test failed:", err);
  }
}

testRedis();
