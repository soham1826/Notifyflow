import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import authRouter from "./src/routes/auth.js";
import notifyRouter from "./src/routes/notify.js";
import dashboardRouter from "./src/routes/dashboard.js";
import notificationsRouter from "./src/routes/notifications.js";
import templatesRouter from "./src/routes/templates.js";
import providersRouter from "./src/routes/providers.js";
import { initializeSubscriber } from "./src/utils/sse.js";
import { highQueue, defaultQueue, bulkQueue } from "./src/queues/notificationQueue.js";
import { getSupabasePublicKey } from "./src/utils/supabasePublicKey.js";

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
    console.log(`[API] Loaded environment variables from: ${envPath}`);
    loadedEnv = true;
    break;
  }
}

if (!loadedEnv) {
  console.warn("[API] Warning: No .env file found in expected paths. Using default environment variables.");
}

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/notify", notifyRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/templates", templatesRouter);
app.use("/api/v1/providers", providersRouter);

// Mount Bull Board dashboard conditionally in development environment
if (process.env.NODE_ENV !== "production") {
  // Use dynamic imports to prevent startup crashes when dev dependencies are not installed in production
  Promise.resolve().then(async () => {
    try {
      const { createBullBoard } = await import("@bull-board/api");
      const { BullMQAdapter } = await import("@bull-board/api/bullMQAdapter.js");
      const { ExpressAdapter } = await import("@bull-board/express");

      const serverAdapter = new ExpressAdapter();
      serverAdapter.setBasePath("/admin/queues");

      createBullBoard({
        queues: [
          // Cast instances to 'any' due to type compatibility mismatches between local BullMQ v5 and @bull-board/api's internal BaseAdapter types
          new BullMQAdapter(highQueue as any) as any,
          new BullMQAdapter(defaultQueue as any) as any,
          new BullMQAdapter(bulkQueue as any) as any,
        ],
        serverAdapter: serverAdapter,
      });

      app.use("/admin/queues", serverAdapter.getRouter());
      console.log("[API] Bull Board dashboard mounted successfully at /admin/queues");
    } catch (error) {
      console.error("[API] Failed to initialize Bull Board:", error);
    }
  });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Root check endpoint
app.get("/", (req, res) => {
  res.status(200).send("Notifyflow API Server is running.");
});

// Eagerly fetch and cache Supabase public key at startup
async function startServer() {
  try {
    console.log("Fetching Supabase public key...");
    await getSupabasePublicKey();
    console.log("Supabase public key cached successfully");
  } catch (error: any) {
    console.error("FATAL: Failed to fetch Supabase JWKS on startup. Exiting.");
    console.error(error.message);
    process.exit(1);
  }

  // Start listening
  app.listen(PORT, () => {
    console.log(`[API] Server is listening on http://localhost:${PORT}`);
    // Initialize shared Redis subscriber for SSE stream
    initializeSubscriber();
  });
}

startServer();

