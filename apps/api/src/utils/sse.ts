import { Response } from "express";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const sseClients = new Map<string, Set<Response>>();
let redisSubscriber: Redis | null = null;

/**
 * Registers an active Express response stream to a tenant's SSE set.
 */
export function registerClient(tenantId: string, res: Response) {
  if (!sseClients.has(tenantId)) {
    sseClients.set(tenantId, new Set());
  }
  sseClients.get(tenantId)!.add(res);
  console.log(`[SSE] Registered client for tenant ${tenantId}. Active connections: ${sseClients.get(tenantId)!.size}`);
}

/**
 * Unregisters an Express response stream from the tenant's SSE set.
 */
export function unregisterClient(tenantId: string, res: Response) {
  const clients = sseClients.get(tenantId);
  if (clients) {
    clients.delete(res);
    console.log(`[SSE] Unregistered client for tenant ${tenantId}. Active connections: ${clients.size}`);
    if (clients.size === 0) {
      sseClients.delete(tenantId);
    }
  }
}

/**
 * Broadcasts an event payload to all active SSE streams registered under a specific tenant.
 */
export function broadcastEvent(tenantId: string, eventData: any) {
  const clients = sseClients.get(tenantId);
  if (clients && clients.size > 0) {
    const dataString = `data: ${JSON.stringify(eventData)}\n\n`;
    for (const res of clients) {
      try {
        res.write(dataString);
      } catch (err) {
        console.error(`[SSE] Failed to write message to tenant ${tenantId} response:`, err);
      }
    }
  }
}

/**
 * Starts the shared Redis subscriber channel and binds it to the SSE broadcast registry.
 */
export function initializeSubscriber() {
  if (redisSubscriber) return;

  console.log("[SSE] Initializing shared Redis subscriber for real-time streams...");
  redisSubscriber = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  redisSubscriber.on("connect", () => {
    console.log("[SSE] Redis subscriber connected successfully.");
  });

  redisSubscriber.on("error", (error) => {
    console.error("[SSE] Redis subscriber error:", error);
  });

  redisSubscriber.subscribe("notifications:events", (err) => {
    if (err) {
      console.error("[SSE] Failed to subscribe to notifications:events channel:", err);
    } else {
      console.log("[SSE] Subscribed to 'notifications:events' Redis Pub/Sub channel.");
    }
  });

  redisSubscriber.on("message", (channel, message) => {
    if (channel === "notifications:events") {
      try {
        const payload = JSON.parse(message);
        if (payload && payload.tenantId) {
          broadcastEvent(payload.tenantId, payload);
        }
      } catch (err) {
        console.error("[SSE] Failed to parse pub/sub message payload:", err);
      }
    }
  });
}
