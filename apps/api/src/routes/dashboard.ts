import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@notifyflow/db";
import { authenticateJwt } from "../middleware/supabaseAuth.js";
import { registerClient, unregisterClient } from "../utils/sse.js";
import { getSupabasePublicKey } from "../utils/supabasePublicKey.js";

const router = Router();

/**
 * GET /api/v1/dashboard/stats
 * Returns summary counts and rates for the logged-in tenant.
 * Supports query param: ?range=today|all
 */
router.get("/stats", authenticateJwt, async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!;
    const range = req.query.range;

    let whereClause: any = {
      tenantId: tenant.id,
    };

    if (range === "today") {
      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);
      whereClause.createdAt = {
        gte: startOfToday,
      };
    }

    // Load tenant notifications matching filter criteria
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      select: {
        status: true,
        channel: true,
      },
    });

    const total = notifications.length;
    const statusCounts = {
      QUEUED: 0,
      PROCESSING: 0,
      DELIVERED: 0,
      FAILED: 0,
      RETRYING: 0,
    };
    const channelCounts = {
      EMAIL: 0,
      SMS: 0,
      WEBHOOK: 0,
      IN_APP: 0,
    };

    for (const n of notifications) {
      if (n.status in statusCounts) {
        statusCounts[n.status as keyof typeof statusCounts]++;
      }
      if (n.channel in channelCounts) {
        channelCounts[n.channel as keyof typeof channelCounts]++;
      }
    }

    const successRate = total > 0 ? Math.round((statusCounts.DELIVERED / total) * 100) : 100;
    const failedRate = total > 0 ? Math.round((statusCounts.FAILED / total) * 100) : 0;

    return res.status(200).json({
      total,
      statusCounts,
      channelCounts,
      successRate,
      failedRate,
    });
  } catch (error) {
    console.error("[Dashboard Stats] Error loading stats:", error);
    return res.status(500).json({ error: "Internal server error fetching statistics" });
  }
});

/**
 * GET /api/v1/dashboard/stream
 * SSE subscription stream for real-time dashboard tracking.
 * Authenticates by extracting JWT token from token query parameter.
 */
router.get("/stream", async (req: Request, res: Response) => {
  try {
    const token = req.query.token;
    if (!token || typeof token !== "string") {
      return res.status(401).json({ error: "Missing authentication token in query parameter" });
    }

    let decoded: any;
    try {
      const publicKey = await getSupabasePublicKey();
      decoded = jwt.verify(token, publicKey, { algorithms: ["ES256"] }) as { sub: string };
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (!decoded || !decoded.sub) {
      return res.status(401).json({ error: "Invalid token structure" });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { supabaseUserId: decoded.sub },
    });

    if (!tenant) {
      return res.status(401).json({ error: "Tenant not found or has been deleted" });
    }

    // Set SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    // Send initial handshake success confirmation event
    res.write(`data: ${JSON.stringify({ event: "connected", tenantId: tenant.id })}\n\n`);

    registerClient(tenant.id, res);

    req.on("close", () => {
      unregisterClient(tenant.id, res);
    });
  } catch (error) {
    console.error("[SSE Stream] Initialization failed:", error);
    return res.status(500).json({ error: "Internal server error starting real-time event stream" });
  }
});

export default router;
