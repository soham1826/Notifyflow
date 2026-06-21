import { Worker } from "bullmq";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { redisConnectionOptions } from "./src/queues/connection.js";
import { notificationProcessor, workerConfigs } from "./src/workers/notificationWorker.js";

// Search for the .env file in expected workspace and root directories
const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../../../.env"),
];

let loadedEnv = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`[Worker Process] Loaded environment variables from: ${envPath}`);
    loadedEnv = true;
    break;
  }
}

if (!loadedEnv) {
  console.warn("[Worker Process] Warning: No .env file found in expected paths.");
}

console.log("[Worker Process] Initializing BullMQ Workers...");

// 1. High Priority Queue Worker (concurrency: 10)
const highWorker = new Worker("high", notificationProcessor, {
  connection: redisConnectionOptions,
  prefix: "notifications",
  concurrency: workerConfigs.high.concurrency,
});

// 2. Default Priority Queue Worker (concurrency: 5)
const defaultWorker = new Worker("default", notificationProcessor, {
  connection: redisConnectionOptions,
  prefix: "notifications",
  concurrency: workerConfigs.default.concurrency,
});

// 3. Bulk Priority Queue Worker (concurrency: 1)
const bulkWorker = new Worker("bulk", notificationProcessor, {
  connection: redisConnectionOptions,
  prefix: "notifications",
  concurrency: workerConfigs.bulk.concurrency,
});

const workers = [
  { name: "high", instance: highWorker },
  { name: "default", instance: defaultWorker },
  { name: "bulk", instance: bulkWorker }
];

// Register listeners for tracking execution and dead-letters
workers.forEach(({ name, instance }) => {
  instance.on("ready", () => {
    console.log(`[Worker Process] Worker for queue '${name}' is ready.`);
  });

  instance.on("active", (job) => {
    console.log(`[Worker Process] Worker '${name}' is processing job ${job.id}`);
  });

  instance.on("completed", (job) => {
    console.log(`[Worker Process] Worker '${name}' completed job ${job.id}`);
  });

  // Log permanently failed jobs (dead-letter queue entries) when all retries are exhausted
  instance.on("failed", (job, err) => {
    const jobId = job ? job.id : "unknown";
    const attemptsMade = job ? job.attemptsMade : 0;
    const maxAttempts = job?.opts?.attempts || 4;

    if (attemptsMade >= maxAttempts) {
      console.error(
        `[Worker Process] [CRITICAL] Job ${jobId} on queue '${name}' permanently FAILED after all ${attemptsMade} attempts (Dead-Letter). Reason: ${err.message}`
      );
    } else {
      console.warn(
        `[Worker Process] Job ${jobId} on queue '${name}' failed attempt ${attemptsMade} of ${maxAttempts}. Will retry. Reason: ${err.message}`
      );
    }
  });

  instance.on("error", (error) => {
    console.error(`[Worker Process] Error in worker '${name}':`, error);
  });
});

console.log("[Worker Process] All priority workers successfully initialized and running.");

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Worker Process] Shutting down workers gracefully...");
  await Promise.all(workers.map(({ instance }) => instance.close()));
  console.log("[Worker Process] Workers closed. Exiting.");
  process.exit(0);
});
