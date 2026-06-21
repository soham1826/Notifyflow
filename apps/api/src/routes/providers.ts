import { Router, Request, Response } from "express";
import { prisma, Channel } from "@notifyflow/db";
import { authenticateJwt } from "../middleware/supabaseAuth.js";
import { ProviderConfigSchema } from "@notifyflow/shared";
import { encryptApiKey, decryptApiKey } from "../utils/encryption.js";
import { resolveChannel } from "../channels/index.js";

const router = Router();

/**
 * Utility helper to mask the raw API Key for safe dashboard visualization.
 * Returns a masked format: "re_••••••1234" showing only the last 4 characters.
 */
function maskApiKey(plaintextKey: string): string {
  if (plaintextKey.length <= 4) {
    return "••••";
  }
  const lastFour = plaintextKey.substring(plaintextKey.length - 4);
  return `re_••••••${lastFour}`;
}

/**
 * GET /api/v1/providers
 * Returns all configured third-party providers for the authenticated tenant.
 * The apiKey property is always masked for security.
 */
router.get("/", authenticateJwt, async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!;
    const configs = await prisma.providerConfig.findMany({
      where: { tenantId: tenant.id },
      orderBy: { channel: "asc" },
    });

    // Decrypt and mask the keys for returned records
    const formatted = configs.map((c) => {
      let maskedKey = "••••";
      try {
        const decrypted = decryptApiKey(c.apiKey);
        maskedKey = maskApiKey(decrypted);
      } catch (err) {
        console.error(`[Providers API] Failed to decrypt stored key for channel ${c.channel}:`, err);
      }

      return {
        ...c,
        apiKey: maskedKey,
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("[Providers API] GET error:", error);
    return res.status(500).json({ error: "Internal server error listing provider configurations" });
  }
});

/**
 * POST /api/v1/providers
 * Registers or updates a provider configuration.
 * Implements a sentinel check to preserve existing keys if a masked key placeholder is submitted.
 */
router.post("/", authenticateJwt, async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!;
    const parsed = ProviderConfigSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { channel, provider, apiKey, config } = parsed.data;

    // Load existing config to see if we need to preserve keys
    const existing = await prisma.providerConfig.findUnique({
      where: {
        tenantId_channel: {
          tenantId: tenant.id,
          channel: channel as Channel,
        },
      },
    });

    let finalApiKey: string;

    // Sentinel check: if the submitted key contains "••", it is the masked display placeholder
    if (apiKey.includes("••")) {
      if (!existing) {
        return res.status(400).json({
          error: "Invalid request payload. Cannot submit a masked API key placeholder for a new provider config.",
        });
      }
      // Preserve the existing encrypted value
      finalApiKey = existing.apiKey;
    } else {
      // It is a brand new plaintext key, encrypt it before saving
      finalApiKey = encryptApiKey(apiKey);
    }

    const saved = await prisma.providerConfig.upsert({
      where: {
        tenantId_channel: {
          tenantId: tenant.id,
          channel: channel as Channel,
        },
      },
      create: {
        tenantId: tenant.id,
        channel: channel as Channel,
        provider,
        apiKey: finalApiKey,
        config: config || {},
      },
      update: {
        provider,
        apiKey: finalApiKey,
        config: config || {},
      },
    });

    // Return saved record with masked key
    let maskedKey = "••••";
    try {
      const decrypted = decryptApiKey(saved.apiKey);
      maskedKey = maskApiKey(decrypted);
    } catch (err) {
      console.error("[Providers API] Failed to decrypt saved key for output:", err);
    }

    return res.status(200).json({
      ...saved,
      apiKey: maskedKey,
    });
  } catch (error) {
    console.error("[Providers API] POST error:", error);
    return res.status(500).json({ error: "Internal server error saving provider configuration" });
  }
});

/**
 * DELETE /api/v1/providers/:channel
 * Deletes the provider configuration for a specific channel.
 */
router.delete("/:channel", authenticateJwt, async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant!;
    const { channel } = req.params;

    // Validate channel enum
    const validChannels = ["EMAIL", "SMS", "WEBHOOK", "IN_APP"];
    if (!validChannels.includes(channel)) {
      return res.status(400).json({ error: `Invalid channel param '${channel}'` });
    }

    const existing = await prisma.providerConfig.findUnique({
      where: {
        tenantId_channel: {
          tenantId: tenant.id,
          channel: channel as Channel,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: `No provider config found for channel ${channel}` });
    }

    await prisma.providerConfig.delete({
      where: {
        tenantId_channel: {
          tenantId: tenant.id,
          channel: channel as Channel,
        },
      },
    });

    return res.status(200).json({ message: `Provider config for channel ${channel} deleted successfully` });
  } catch (error) {
    console.error("[Providers API] DELETE error:", error);
    return res.status(500).json({ error: "Internal server error deleting provider configuration" });
  }
});

/**
 * POST /api/v1/providers/:channel/test
 * Decrypts credentials for the given channel, instantiates the channel,
 * and dispatches a test notification directly (no queueing).
 * Always returns 200 with { success: boolean, error?: string } to avoid 500 crashes.
 */
router.post("/:channel/test", authenticateJwt, async (req: Request, res: Response) => {
  const { channel } = req.params;
  const tenant = req.tenant!;

  // Validate channel enum
  const validChannels = ["EMAIL", "SMS", "WEBHOOK", "IN_APP"];
  if (!validChannels.includes(channel)) {
    return res.status(400).json({ error: `Invalid channel param '${channel}'` });
  }

  try {
    const providerConfig = await prisma.providerConfig.findUnique({
      where: {
        tenantId_channel: {
          tenantId: tenant.id,
          channel: channel as Channel,
        },
      },
    });

    if (!providerConfig) {
      return res.status(200).json({
        success: false,
        error: `No provider config found for channel ${channel}. Please configure and save a provider first.`,
      });
    }

    let recipient = "";
    if (channel === "EMAIL") {
      recipient = tenant.email;
    } else if (channel === "SMS") {
      recipient = (req.body.recipient as string) || "+15555555555";
    } else if (channel === "WEBHOOK") {
      recipient = (req.body.recipient as string) || "https://httpbin.org/post";
    } else if (channel === "IN_APP") {
      recipient = "test-user-id";
    }

    try {
      const channelService = resolveChannel(
        channel as Channel,
        providerConfig,
        {
          tenantId: tenant.id,
          notificationId: "test-notification-id",
        }
      );

      const sendResult = await channelService.send(
        recipient,
        {
          subject: "Notifyflow Test Connection",
          body: `This is a test notification from Notifyflow verifying your provider configuration for ${channel}.`,
        },
        {}
      );

      if (!sendResult.success) {
        return res.status(200).json({
          success: false,
          error: sendResult.error || "Channel failed to deliver test message",
        });
      }

      return res.status(200).json({
        success: true,
      });
    } catch (sendError: unknown) {
      const errorMsg = sendError instanceof Error ? sendError.message : String(sendError);
      return res.status(200).json({
        success: false,
        error: errorMsg,
      });
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: `Failed to execute test: ${errorMsg}` });
  }
});

export default router;
