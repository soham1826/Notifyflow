import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "@notifyflow/db";
import { ApiKeyResponse } from "@notifyflow/shared";
import { generateApiKey } from "../utils/crypto.js";
import { authenticateJwt, verifySupabaseToken } from "../middleware/supabaseAuth.js";
import { provisionTenantRateLimiter } from "../middleware/rateLimiter.js";
import { redisConnection } from "../queues/connection.js";

const router = Router();

// Max 3 account creations per IP per 24 hours
const signupLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() 
    || req.socket.remoteAddress 
    || 'unknown'
  
  const key = `signup:${ip}`
  const limit = 3
  const windowMs = 24 * 60 * 60 * 1000 // 24 hours in ms
  const now = Date.now()

  const luaScript = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local limit = tonumber(ARGV[3])
    local member = ARGV[4]
    
    redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
    local count = redis.call('ZCARD', key)
    
    if count < limit then
      redis.call('ZADD', key, now, member)
      redis.call('EXPIRE', key, math.ceil(window / 1000))
      return 1
    else
      return 0
    end
  `

  const result = await redisConnection.eval(
    luaScript,
    1,
    key,
    now.toString(),
    windowMs.toString(),
    limit.toString(),
    `${now}:${Math.random()}`
  )

  if (result === 0) {
    return res.status(429).json({
      error: 'Too many accounts created from this IP. Please try again tomorrow.',
      code: 'SIGNUP_RATE_LIMIT_EXCEEDED'
    })
  }

  next()
}

/**
 * POST /api/v1/auth/provision-tenant
 * Protected by IP-based rate limiting.
 * Verifies the Supabase JWT in Authorization header, provisions a tenant database
 * record if it does not exist, and returns registration details.
 */
router.post(
  "/provision-tenant",
  provisionTenantRateLimiter,
  signupLimiter,
  async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or malformed authorization token" });
      }
      const token = authHeader.split(" ")[1];

      let decodedPayload;
      try {
        decodedPayload = await verifySupabaseToken(token);
      } catch (err: any) {
        return res.status(401).json({ error: err.message || "Invalid authentication token" });
      }

      const { sub, email, name } = decodedPayload;

      // Find or provision tenant record
      let tenant = await prisma.tenant.findUnique({
        where: { supabaseUserId: sub },
      });

      if (!tenant) {
        // Check if a legacy tenant with the same email exists
        const legacyTenant = await prisma.tenant.findUnique({
          where: { email },
        });

        if (legacyTenant) {
          // Link legacy account to Supabase Auth
          tenant = await prisma.tenant.update({
            where: { id: legacyTenant.id },
            data: { supabaseUserId: sub },
          });
        } else {
          // Create a brand new tenant record
          const apiKey = generateApiKey();
          tenant = await prisma.tenant.create({
            data: {
              name,
              email,
              supabaseUserId: sub,
              passwordHash: null,
              apiKey,
            },
          });
        }
      }

      // Mask API key for top-level payload security
      const maskedKey = tenant.apiKey.substring(0, 8) + "•".repeat(Math.max(0, tenant.apiKey.length - 8));

      return res.status(200).json({
        tenantId: tenant.id,
        apiKey: maskedKey,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          email: tenant.email,
          apiKey: tenant.apiKey,
          createdAt: tenant.createdAt.toISOString(),
        },
      });
    } catch (error) {
      console.error("Provision tenant error:", error);
      return res.status(500).json({ error: "Internal server error provisioning tenant" });
    }
  }
);

/**
 * POST /api/v1/auth/regenerate-key
 * Regenerates the API key for the authenticated tenant.
 */
router.post(
  "/regenerate-key",
  authenticateJwt,
  async (req: Request, res: Response) => {
    try {
      const tenant = req.tenant!;
      const newApiKey = generateApiKey();

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { apiKey: newApiKey },
      });

      const responseData: ApiKeyResponse = {
        apiKey: newApiKey,
      };

      return res.status(200).json(responseData);
    } catch (error) {
      console.error("Regenerate key error:", error);
      return res.status(500).json({ error: "Internal server error regenerating API key" });
    }
  }
);

export default router;
