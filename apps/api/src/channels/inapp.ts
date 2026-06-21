import { prisma } from "@notifyflow/db";
import { NotificationChannel, SendResult } from "./channel.js";

/**
 * Delivery channel that saves notifications inside our database inapp_notifications table,
 * which can then be fetched by tenants' client apps.
 */
export class InAppChannel implements NotificationChannel {
  constructor(private tenantId: string) {}

  async send(
    recipient: string, // This represents the recipientId (e.g. user ID in tenant's app)
    content: { subject: string | null; body: string },
    data: Record<string, string | number | boolean>
  ): Promise<SendResult> {
    try {
      const title = content.subject || "New Notification";

      const inAppRecord = await prisma.inAppNotification.create({
        data: {
          tenantId: this.tenantId,
          recipientId: recipient,
          title,
          body: content.body,
          read: false,
        },
      });

      return {
        success: true,
        providerMessageId: inAppRecord.id,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || String(error),
      };
    }
  }
}
