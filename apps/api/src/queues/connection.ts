import { ConnectionOptions } from "bullmq";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

/**
 * Parses a Redis connection URL into BullMQ-compatible ConnectionOptions.
 */
export function parseRedisUrl(url: string): ConnectionOptions {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || "127.0.0.1",
      port: parsed.port ? parseInt(parsed.port, 10) : 6379,
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      maxRetriesPerRequest: null,
    };
  } catch (error) {
    console.error("[Redis] Failed to parse REDIS_URL, falling back to localhost:", error);
    return {
      host: "127.0.0.1",
      port: 6379,
      maxRetriesPerRequest: null,
    };
  }
}

export const redisConnectionOptions = parseRedisUrl(REDIS_URL);

/**
 * Active Redis client instance from ioredis.
 * Used for direct operations like running Lua scripts in the rate limiter.
 */
export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("[Redis] Client connected successfully.");
});

redisConnection.on("error", (error) => {
  console.error("[Redis] Client error:", error);
});
