import { Channel, ProviderConfig } from "@notifyflow/db";
import { NotificationChannel } from "./channel.js";
import { EmailChannel } from "./email.js";
import { SmsChannel } from "./sms.js";
import { WebhookChannel } from "./webhook.js";
import { InAppChannel } from "./inapp.js";
import { decryptApiKey } from "../utils/encryption.js";

export class NoProviderConfiguredError extends Error {
  constructor(channel: Channel) {
    super(`No provider configured for channel: ${channel}`);
    this.name = "NoProviderConfiguredError";
  }
}

export function resolveChannel(
  channel: Channel,
  providerConfig: ProviderConfig | null,
  context: { notificationId?: string; tenantId?: string }
): NotificationChannel {
  switch (channel) {
    case "EMAIL": {
      if (!providerConfig || !providerConfig.enabled) {
        throw new NoProviderConfiguredError(channel);
      }
      const decryptedKey = decryptApiKey(providerConfig.apiKey);
      const config = (providerConfig.config || {}) as Record<string, string>;
      return new EmailChannel(decryptedKey, config);
    }
    case "SMS": {
      if (!providerConfig || !providerConfig.enabled) {
        throw new NoProviderConfiguredError(channel);
      }
      const decryptedKey = decryptApiKey(providerConfig.apiKey);
      const config = (providerConfig.config || {}) as Record<string, string>;
      return new SmsChannel(decryptedKey, config);
    }
    case "WEBHOOK": {
      if (!context.notificationId) {
        throw new Error("notificationId context is required for WEBHOOK channel");
      }
      // If the tenant has stored a per-tenant webhook signing secret in their ProviderConfig,
      // decrypt and use it. Otherwise WebhookChannel falls back to the global env WEBHOOK_SECRET.
      let signingSecret: string | undefined;
      if (providerConfig && providerConfig.enabled) {
        try {
          signingSecret = decryptApiKey(providerConfig.apiKey);
        } catch {
          console.warn("[Channels] Failed to decrypt WEBHOOK signing secret, using global fallback.");
        }
      }
      return new WebhookChannel(context.notificationId, signingSecret);
    }
    case "IN_APP": {
      if (!context.tenantId) {
        throw new Error("tenantId context is required for IN_APP channel");
      }
      return new InAppChannel(context.tenantId);
    }
    default: {
      const exhaustiveCheck: never = channel;
      throw new Error(`Unsupported channel: ${exhaustiveCheck}`);
    }
  }
}
