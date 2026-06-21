import { Queue } from "bullmq";
import { redisConnectionOptions } from "./connection.js";

export interface NotificationJob {
  notificationId: string;
  tenantId: string;
  channel: "EMAIL" | "WEBHOOK" | "IN_APP" | "SMS";
  recipient: string;
  templateId: string | null;
  rawSubject: string | null;
  rawBody: string | null;
  data: Record<string, string | number | boolean>;
  priority: "HIGH" | "DEFAULT" | "BULK";
}

const defaultJobOptions = {
  attempts: 4,
  backoff: {
    type: "exponential",
    delay: 2000, // Starts at 2s (exponential: 2s, 4s, 8s, 16s)
  },
  removeOnComplete: 100, // Limit completed jobs stored in Redis to 100
  removeOnFail: 500,     // Limit failed jobs stored in Redis to 500
};

// Initialize Queues. We use the prefix option 'notifications' to create 
// the Redis key namespaces 'notifications:high', 'notifications:default', 
// and 'notifications:bulk' safely without triggering the BullMQ v5 queue name colon error.
export const highQueue = new Queue<NotificationJob, any, string>("high", {
  connection: redisConnectionOptions,
  prefix: "notifications",
  defaultJobOptions,
});

export const defaultQueue = new Queue<NotificationJob, any, string>("default", {
  connection: redisConnectionOptions,
  prefix: "notifications",
  defaultJobOptions,
});

export const bulkQueue = new Queue<NotificationJob, any, string>("bulk", {
  connection: redisConnectionOptions,
  prefix: "notifications",
  defaultJobOptions,
});

/**
 * Routes a notification job payload to the appropriate priority queue.
 */
export async function queueNotification(job: NotificationJob) {
  const jobName = `send_${job.channel.toLowerCase()}_${job.notificationId}`;

  switch (job.priority) {
    case "HIGH":
      await highQueue.add(jobName, job);
      break;
    case "BULK":
      await bulkQueue.add(jobName, job);
      break;
    case "DEFAULT":
    default:
      await defaultQueue.add(jobName, job);
      break;
  }
}
