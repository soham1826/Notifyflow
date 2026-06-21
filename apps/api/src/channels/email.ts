import { Resend } from "resend";
import { NotificationChannel, SendResult } from "./channel.js";

/**
 * Email delivery channel leveraging the Resend SDK.
 * Configured dynamically per-tenant using their own Resend API Key.
 */
export class EmailChannel implements NotificationChannel {
  private resend: Resend;
  private from: string;

  constructor(apiKey: string, config: Record<string, string>) {
    this.resend = new Resend(apiKey);
    const fromName = config.fromName;
    const fromEmail = config.fromEmail || "onboarding@resend.dev";
    this.from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
  }

  async send(
    recipient: string,
    content: { subject: string | null; body: string },
    data: Record<string, string | number | boolean>
  ): Promise<SendResult> {
    try {
      const subject = content.subject || "No Subject";

      const emailResponse = await this.resend.emails.send({
        from: this.from,
        to: recipient,
        subject: subject,
        html: content.body,
      });

      if (emailResponse.error) {
        return {
          success: false,
          error: emailResponse.error.message,
        };
      }

      return {
        success: true,
        providerMessageId: emailResponse.data?.id || undefined,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

