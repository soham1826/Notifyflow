import crypto from "crypto";
import { NotificationChannel, SendResult } from "./channel.js";

/**
 * Webhook delivery channel that sends POST HTTP requests to tenant endpoints,
 * secured by an HMAC-SHA256 signature header.
 */
export class WebhookChannel implements NotificationChannel {
  private signingSecret: string;

  constructor(private notificationId: string, signingSecret?: string) {
    // Use per-tenant signing secret if provided, otherwise fall back to the global env var
    this.signingSecret =
      signingSecret ||
      process.env.WEBHOOK_SECRET ||
      "default_webhook_signing_secret_change_in_production";
  }

  async send(
    recipient: string, // This represents the target URL
    content: { subject: string | null; body: string },
    data: Record<string, string | number | boolean>
  ): Promise<SendResult> {
    try {
      // Validate that the recipient is indeed a valid URL
      new URL(recipient);

      const payload = {
        notificationId: this.notificationId,
        recipient,
        channel: "WEBHOOK",
        subject: content.subject,
        body: content.body,
        data,
        timestamp: new Date().toISOString(),
      };

      const payloadString = JSON.stringify(payload);

      // Generate the HMAC signature using the per-tenant signing secret (or global fallback)
      const signature = crypto
        .createHmac("sha256", this.signingSecret)
        .update(payloadString)
        .digest("hex");

      const response = await fetch(recipient, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-notifyflow-signature": signature,
          "User-Agent": "Notifyflow-Webhook-Engine/1.0",
        },
        body: payloadString,
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Webhook delivery failed. Target returned HTTP status ${response.status} (${response.statusText})`,
        };
      }

      return {
        success: true,
        providerMessageId: `webhook_ack_${response.status}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || String(error),
      };
    }
  }
}
