import { Router, Request, Response } from "express";
import { prisma, Channel, Priority } from "@notifyflow/db";
import { NotifyRequestSchema, NotifyResponse } from "@notifyflow/shared";
import { authenticateApiKey } from "../middleware/auth.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { queueNotification, NotificationJob } from "../queues/notificationQueue.js";

const router = Router();

/**
 * POST /api/v1/notify
 * Enqueues a notification delivery request.
 */
router.post(
  "/",
  authenticateApiKey,
  rateLimiter,
  async (req: Request, res: Response) => {
    try {
      const tenant = req.tenant!;
      const parsed = NotifyRequestSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const {
        recipient,
        channel,
        templateName,
        rawSubject,
        rawBody,
        data,
        priority,
      } = parsed.data;

      // Hard cap: 10,000 notifications per tenant (demo platform limit)
      const notificationCount = await prisma.notification.count({
        where: { tenantId: tenant.id }
      })

      if (notificationCount >= 10000) {
        return res.status(429).json({
          error: 'Notification limit reached. This demo platform has a 10,000 notification limit per tenant. Please contact us to discuss production use.',
          code: 'NOTIFICATION_LIMIT_REACHED',
          limit: 10000,
          current: notificationCount
        })
      }

      let templateId: string | null = null;

      // 1. Resolve template name if provided
      if (templateName) {
        const template = await prisma.template.findFirst({
          where: {
            tenantId: tenant.id,
            name: templateName,
          },
        });

        if (!template) {
          return res.status(400).json({
            error: `Template '${templateName}' not found for this tenant`,
          });
        }

        templateId = template.id;
      }

      // Check if provider is configured for EMAIL / SMS channels
      if (channel === "EMAIL" || channel === "SMS") {
        const providerConfig = await prisma.providerConfig.findUnique({
          where: {
            tenantId_channel: {
              tenantId: tenant.id,
              channel: channel as Channel,
            },
          },
        });

        if (!providerConfig || !providerConfig.enabled) {
          return res.status(422).json({
            error: "Unprocessable Entity",
            code: "NO_PROVIDER_CONFIGURED",
            message: `No active provider configured for channel: ${channel}. Please set up a provider configuration first.`,
          });
        }
      }

      // 2. Create the notification record in the database
      const notification = await prisma.notification.create({
        data: {
          tenantId: tenant.id,
          channel: channel as Channel,
          recipient,
          templateId,
          rawSubject: rawSubject || null,
          rawBody: rawBody || null,
          data: data || {},
          priority: priority as Priority,
          status: "QUEUED",
        },
      });

      // 3. Queue the notification in BullMQ
      const jobPayload: NotificationJob = {
        notificationId: notification.id,
        tenantId: tenant.id,
        channel,
        recipient,
        templateId,
        rawSubject: rawSubject || null,
        rawBody: rawBody || null,
        data: data || {},
        priority,
      };

      await queueNotification(jobPayload);

      // 4. Return success immediately
      const responseData: NotifyResponse = {
        notificationId: notification.id,
        status: "queued",
      };

      // The user requested { notification_id, status: "queued" } shape. Let's return both formats to be extremely safe.
      return res.status(202).json({
        notification_id: notification.id,
        notificationId: notification.id,
        status: "queued",
      });
    } catch (error) {
      console.error("Notify endpoint error:", error);
      return res.status(500).json({ error: "Internal server error queuing notification" });
    }
  }
);

/**
 * GET /api/v1/notify/inapp/:recipientId
 * Returns last 5 in-app notifications for the recipient, authenticated by x-api-key.
 */
router.get(
  "/inapp/:recipientId",
  authenticateApiKey,
  async (req: Request, res: Response) => {
    try {
      const tenant = req.tenant!;
      const { recipientId } = req.params;

      const notifications = await prisma.inAppNotification.findMany({
        where: {
          tenantId: tenant.id,
          recipientId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      return res.status(200).json({ notifications });
    } catch (error) {
      console.error("Fetch inapp notifications error:", error);
      return res.status(500).json({ error: "Internal server error fetching in-app notifications" });
    }
  }
);

/**
 * POST /api/v1/notify/inapp/:recipientId/read
 * Marks all unread in-app notifications for the recipient as read.
 */
router.post(
  "/inapp/:recipientId/read",
  authenticateApiKey,
  async (req: Request, res: Response) => {
    try {
      const tenant = req.tenant!;
      const { recipientId } = req.params;

      await prisma.inAppNotification.updateMany({
        where: {
          tenantId: tenant.id,
          recipientId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Mark inapp notifications read error:", error);
      return res.status(500).json({ error: "Internal server error marking in-app notifications as read" });
    }
  }
);

/**
 * GET /api/v1/notify/:id
 * Returns the status, channel, recipient, and details of a single notification.
 * Authenticated by x-api-key.
 */
router.get(
  "/:id",
  authenticateApiKey,
  async (req: Request, res: Response) => {
    try {
      const tenant = req.tenant!;
      const { id } = req.params;

      const notification = await prisma.notification.findUnique({
        where: {
          id,
          tenantId: tenant.id,
        },
        include: {
          attempts: {
            orderBy: { attemptNumber: "desc" },
            take: 1,
            select: {
              error: true,
            },
          },
        },
      });

      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }

      return res.status(200).json({ notification });
    } catch (error) {
      console.error("Fetch single notification error:", error);
      return res.status(500).json({ error: "Internal server error fetching notification" });
    }
  }
);

export default router;
