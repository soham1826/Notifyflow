import { Job, Worker } from "bullmq";
import { prisma, Channel, Priority, NotificationStatus, AttemptStatus } from "@notifyflow/db";
import { NotificationJob } from "../queues/notificationQueue.js";
import { interpolate } from "../utils/template.js";
import { NotificationChannel, SendResult } from "../channels/channel.js";
import { resolveChannel, NoProviderConfiguredError } from "../channels/index.js";
import { redisConnection, redisConnectionOptions } from "../queues/connection.js";

/**
 * Processor configurations for workers
 */
export const workerConfigs = {
  high: { concurrency: 10 },
  default: { concurrency: 5 },
  bulk: { concurrency: 1 },
};




/**
 * Helper to publish real-time notification events to Redis Pub/Sub
 */
async function publishEvent(
  tenantId: string,
  notificationId: string,
  status: "PROCESSING" | "RETRYING" | "DELIVERED" | "FAILED",
  channel: string,
  recipient: string,
  error: string | null = null
) {
  try {
    const eventPayload = {
      tenantId,
      notificationId,
      status,
      channel,
      recipient,
      error,
      timestamp: Date.now(),
    };
    await redisConnection.publish("notifications:events", JSON.stringify(eventPayload));
  } catch (err) {
    console.error("[Worker] Failed to publish event to Redis:", err);
  }
}

/**
 * Main job processing logic for notification delivery.
 */
export async function notificationProcessor(job: Job<NotificationJob, any, string>): Promise<void> {
  const {
    notificationId,
    tenantId,
    channel,
    recipient,
    templateId,
    rawSubject,
    rawBody,
    data, // Record<string, string | number | boolean>
  } = job.data;

  // BullMQ attemptsMade is 0-indexed (0 on first run, 1 on second, etc.)
  const attemptNumber = job.attemptsMade + 1;

  try {
    console.log(`[Worker] Processing notification ${notificationId} (${channel}) - Attempt ${attemptNumber}`);

    // 1. Update notification status to PROCESSING in the database
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: "PROCESSING" },
    });
    await publishEvent(tenantId, notificationId, "PROCESSING", channel, recipient);

    let subject: string | null = null;
    let body = "";

    // 2. Resolve template or use raw content
    if (templateId) {
      const template = await prisma.template.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        throw new Error(`Template record '${templateId}' not found in database`);
      }

      subject = template.subject;
      body = template.body;
    } else {
      subject = rawSubject;
      body = rawBody || "";
    }

    // 3. Interpolate placeholders {{variable}} using strict data records
    const finalSubject = subject ? interpolate(subject, data) : null;
    const finalBody = interpolate(body, data);

    // 4. Query provider config for dynamic API key resolution
    const providerConfig = await prisma.providerConfig.findUnique({
      where: {
        tenantId_channel: {
          tenantId,
          channel,
        },
      },
    });

    // 5. Resolve the channel polymorphically
    const channelService = resolveChannel(channel, providerConfig, { notificationId, tenantId });

    // 6. Send message
    const sendResult = await channelService.send(recipient, { subject: finalSubject, body: finalBody }, data);

    if (!sendResult.success) {
      throw new Error(sendResult.error || "Channel failed to deliver notification");
    }

    // 7. On success: Update database notification record and log the delivery attempt
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    await prisma.deliveryAttempt.create({
      data: {
        notificationId,
        attemptNumber,
        status: "DELIVERED" as AttemptStatus,
      },
    });

    await publishEvent(tenantId, notificationId, "DELIVERED", channel, recipient);

    console.log(`[Worker] Notification ${notificationId} delivered successfully on attempt ${attemptNumber}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Worker] Error sending notification ${notificationId} on attempt ${attemptNumber}:`, errorMessage);

    const isNoProviderError = error instanceof NoProviderConfiguredError;

    // 8. On failure: Log attempt in delivery_attempts table
    await prisma.deliveryAttempt.create({
      data: {
        notificationId,
        attemptNumber,
        status: "FAILED" as AttemptStatus,
        error: errorMessage,
      },
    });

    // Check if this is the final attempt (max 4 attempts) or if it's a NoProviderConfiguredError (which should fail immediately)
    if (attemptNumber < 4 && !isNoProviderError) {
      // Mark notification status as RETRYING so dashboard knows it's pending retry
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: "RETRYING" },
      });
      await publishEvent(tenantId, notificationId, "RETRYING", channel, recipient, errorMessage);
    } else {
      // Exhausted all retries or NoProviderConfiguredError: Mark notification status as FAILED
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: "FAILED" },
      });
      await publishEvent(tenantId, notificationId, "FAILED", channel, recipient, errorMessage);
    }

    // If it's a NoProviderConfiguredError, complete the job normally without retrying
    if (isNoProviderError) {
      return;
    }

    // Rethrow error so BullMQ can handle retry schedules and backoffs
    throw error;
  }
}

let activeWorkers: any[] = [];

/**
 * Initializes and starts all BullMQ workers inside the API process.
 */
export function initializeWorkers(): void {
  console.log("[API Process] Initializing BullMQ Workers...");

  const highWorker = new Worker("high", notificationProcessor, {
    connection: redisConnectionOptions,
    prefix: "notifications",
    concurrency: workerConfigs.high.concurrency,
  });

  const defaultWorker = new Worker("default", notificationProcessor, {
    connection: redisConnectionOptions,
    prefix: "notifications",
    concurrency: workerConfigs.default.concurrency,
  });

  const bulkWorker = new Worker("bulk", notificationProcessor, {
    connection: redisConnectionOptions,
    prefix: "notifications",
    concurrency: workerConfigs.bulk.concurrency,
  });

  const workersList = [
    { name: "high", instance: highWorker },
    { name: "default", instance: defaultWorker },
    { name: "bulk", instance: bulkWorker }
  ];

  workersList.forEach(({ name, instance }) => {
    instance.on("ready", () => {
      console.log(`[API Process] Worker for queue '${name}' is ready.`);
    });

    instance.on("active", (job) => {
      console.log(`[API Process] Worker '${name}' is processing job ${job.id}`);
    });

    instance.on("completed", (job) => {
      console.log(`[API Process] Worker '${name}' completed job ${job.id}`);
    });

    instance.on("failed", (job, err) => {
      const jobId = job ? job.id : "unknown";
      const attemptsMade = job ? job.attemptsMade : 0;
      const maxAttempts = job?.opts?.attempts || 4;

      if (attemptsMade >= maxAttempts) {
        console.error(
          `[API Process] [CRITICAL] Job ${jobId} on queue '${name}' permanently FAILED after all ${attemptsMade} attempts (Dead-Letter). Reason: ${err.message}`
        );
      } else {
        console.warn(
          `[API Process] Job ${jobId} on queue '${name}' failed attempt ${attemptsMade} of ${maxAttempts}. Will retry. Reason: ${err.message}`
        );
      }
    });

    instance.on("error", (error) => {
      console.error(`[API Process] Error in worker '${name}':`, error);
    });
  });

  activeWorkers = workersList;
  console.log("[API Process] All priority workers successfully initialized and running inside API process.");
}

/**
 * Gracefully shuts down the active workers.
 */
export async function shutdownWorkers(): Promise<void> {
  if (activeWorkers.length > 0) {
    console.log("[API Process] Shutting down workers gracefully...");
    await Promise.all(activeWorkers.map(({ instance }) => instance.close()));
    console.log("[API Process] Workers closed.");
  }
}
