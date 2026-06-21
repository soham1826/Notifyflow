export interface SendResult {
  success: boolean;
  error?: string;
  providerMessageId?: string;
}

/**
 * Common contract that all channels (Email, Webhook, SMS, In-App) must implement.
 */
export interface NotificationChannel {
  send(
    recipient: string,
    content: { subject: string | null; body: string },
    data: Record<string, string | number | boolean>
  ): Promise<SendResult>;
}
