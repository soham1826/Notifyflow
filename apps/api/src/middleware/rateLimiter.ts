import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { redisConnection } from "../queues/connection.js";

// Atomic Lua script running on Redis. 
// Guarantees atomicity and eliminates checks-then-sets race conditions.
const LUA_SLIDING_WINDOW = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])
  local member = ARGV[4]

  -- 1. Remove old requests outside the sliding window
  redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

  -- 2. Count active requests within the window
  local current_requests = redis.call('ZCARD', key)

  -- 3. Enforce limit
  if current_requests < limit then
    -- Record this request
    redis.call('ZADD', key, now, member)
    -- Set/refresh TTL to match window duration (in seconds)
    redis.call('EXPIRE', key, math.ceil(window / 1000))
    return {1, 0}
  else
    -- Retrieve the oldest request to calculate exact Retry-After delay
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local oldest_score = 0
    if oldest and oldest[2] then
      oldest_score = tonumber(oldest[2])
    end
    local retry_after = math.ceil((oldest_score + window - now) / 1000)
    if retry_after <= 0 then retry_after = 1 end
    return {0, retry_after}
  end
`;

/**
 * Middleware protecting endpoints from traffic bursts.
 * Restricts the authenticated tenant to 100 requests/minute.
 */
export async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(500).json({ error: "Internal rate limiter config error: Tenant not authenticated" });
    }

    const key = `ratelimit:${tenant.id}`;
    const now = Date.now();
    const windowMs = 60000; // 60 seconds rolling window
    const limit = 100;     // 100 requests max
    const member = `${now}:${crypto.randomUUID()}`;

    // Execute script atomically in Redis
    const result = await redisConnection.eval(
      LUA_SLIDING_WINDOW,
      1,
      key,
      now.toString(),
      windowMs.toString(),
      limit.toString(),
      member
    ) as [number, number];

    const [allowed, retryAfter] = result;

    if (allowed === 1) {
      return next();
    } else {
      res.setHeader("Retry-After", retryAfter.toString());
      return res.status(429).json({
        error: "Too Many Requests",
        message: "API rate limit exceeded. You are limited to 100 requests per minute.",
        retryAfter,
      });
    }
  } catch (error) {
    console.error("[RateLimiter] Redis error: Fail-open requested.", error);
    // Fail-open in production so Redis downtime doesn't brick client services
    return next();
  }
}

/**
 * Factory to create IP-based rate limiter middleware.
 */
export function createIpRateLimiter(limit: number, windowMs: number, errorMessage: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown_ip";
      const ip = Array.isArray(rawIp)
        ? rawIp[0]
        : typeof rawIp === "string"
        ? rawIp.split(",")[0].trim()
        : "unknown_ip";

      const key = `ratelimit:ip:${ip}`;
      const now = Date.now();
      const member = `${now}:${crypto.randomUUID()}`;

      // Execute script atomically in Redis
      const result = await redisConnection.eval(
        LUA_SLIDING_WINDOW,
        1,
        key,
        now.toString(),
        windowMs.toString(),
        limit.toString(),
        member
      ) as [number, number];

      const [allowed, retryAfter] = result;

      if (allowed === 1) {
        return next();
      } else {
        res.setHeader("Retry-After", retryAfter.toString());
        return res.status(429).json({
          error: "Too Many Requests",
          message: errorMessage,
          retryAfter,
        });
      }
    } catch (error) {
      console.error("[IpRateLimiter] Redis error: Fail-open requested.", error);
      return next();
    }
  };
}

export const provisionTenantRateLimiter = createIpRateLimiter(
  10,
  60000,
  "Too many requests from this IP. You can only make 10 requests per minute."
);
