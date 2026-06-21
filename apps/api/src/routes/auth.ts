import { Router, Request, Response } from "express";
import { prisma } from "@notifyflow/db";
import { ApiKeyResponse } from "@notifyflow/shared";
import { generateApiKey } from "../utils/crypto.js";
import { authenticateJwt, verifySupabaseToken } from "../middleware/supabaseAuth.js";
import { provisionTenantRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

/**
 * POST /api/v1/auth/provision-tenant
 * Protected by IP-based rate limiting.
 * Verifies the Supabase JWT in Authorization header, provisions a tenant database
 * record if it does not exist, and returns registration details.
 */
router.post(
  "/provision-tenant",
  provisionTenantRateLimiter,
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
