import { Router, Request, Response } from "express";
import { prisma, Channel, Priority } from "@notifyflow/db";
import { authenticateJwt } from "../middleware/supabaseAuth.js";
import { queueNotification, NotificationJob } from "../queues/notificationQueue.js";

const router = Router();

/**
 * GET /api/v1/notifications
 * Paginated list of notifications for the authenticated tenant.
 * Supports filtering by status and channel.
 */
router.get("/", authenticateJwt, async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);
    const status = req.query.status as string;
    const channel = req.query.channel as string;

    const skip = (page - 1) * limit;

    const whereClause: any = {
      tenantId: tenant.id,
    };

    if (status) {
      whereClause.status = status;
    }
    if (channel) {
      whereClause.channel = channel;
    }

    // Load total count and dataset concurrently
    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where: whereClause }),
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          template: {
            select: {
              name: true,
            },
          },
          attempts: {
            orderBy: { attemptNumber: "desc" },
            take: 1,
            select: {
              error: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("[Notifications API] Error loading list:", error);
    return res.status(500).json({ error: "Internal server error fetching notifications list" });
  }
});

/**
 * GET /api/v1/notifications/:id/attempts
 * Chronological attempts list for a single notification.
 */
router.get("/:id/attempts", authenticateJwt, async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!;
    const { id } = req.params;

    // Verify ownership and load attempts in one go
    const notification = await prisma.notification.findUnique({
      where: {
        id,
        tenantId: tenant.id,
      },
      include: {
        attempts: {
          orderBy: { attemptNumber: "asc" },
        },
      },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification record not found" });
    }

    return res.status(200).json({
      notification,
      attempts: notification.attempts,
    });
  } catch (error) {
    console.error("[Notifications API] Error loading attempts:", error);
    return res.status(500).json({ error: "Internal server error fetching attempts log" });
  }
});

/**
 * POST /api/v1/notifications/:id/retry
 * Re-queues a permanently failed notification to run again.
 */
router.post("/:id/retry", authenticateJwt, async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!;
    const { id } = req.params;

    // Load original notification
    const notification = await prisma.notification.findUnique({
      where: {
        id,
        tenantId: tenant.id,
      },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification record not found" });
    }

    if (notification.status !== "FAILED") {
      return res.status(400).json({ error: "Only notifications in FAILED state can be manually retried" });
    }

    // Reset database status to QUEUED
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: "QUEUED",
        deliveredAt: null,
      },
    });

    // Queue fresh job in BullMQ
    const jobPayload: NotificationJob = {
      notificationId: notification.id,
      tenantId: tenant.id,
      channel: notification.channel as Channel,
      recipient: notification.recipient,
      templateId: notification.templateId,
      rawSubject: notification.rawSubject,
      rawBody: notification.rawBody,
      data: notification.data as Record<string, string | number | boolean>,
      priority: notification.priority as Priority,
    };

    await queueNotification(jobPayload);

    return res.status(200).json({ message: "Notification queued for retry successfully" });
  } catch (error) {
    console.error("[Notifications API] Error executing retry:", error);
    return res.status(500).json({ error: "Internal server error queuing retry" });
  }
});

export default router;
