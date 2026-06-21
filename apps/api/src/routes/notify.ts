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

export default router;
