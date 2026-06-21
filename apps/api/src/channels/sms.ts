import { NotificationChannel, SendResult } from "./channel.js";

/**
 * Mock implementation of SMS channel to demonstrate extensibility.
 * Accepts credentials and logs them in a masked format.
 */
export class SmsChannel implements NotificationChannel {
  private apiKey: string;
  private config: Record<string, string>;

  constructor(apiKey: string, config: Record<string, string>) {
    this.apiKey = apiKey;
    this.config = config;
  }

  async send(
    recipient: string,
    content: { subject: string | null; body: string },
    data: Record<string, string | number | boolean>
  ): Promise<SendResult> {
    try {
      // Mask the key for demonstration
      const maskedKey = this.apiKey.length > 8 
        ? `${this.apiKey.substring(0, 4)}...${this.apiKey.substring(this.apiKey.length - 4)}`
        : "****";

      console.log(`[SMS Channel Mock] Sending SMS to recipient: ${recipient}`);
      console.log(`[SMS Channel Mock] Content Body: "${content.body}"`);
      console.log(`[SMS Channel Mock] Using API Key: ${maskedKey}`);
      console.log(`[SMS Channel Mock] Config:`, this.config);
      console.log(`[SMS Channel Mock] Metadata data payload:`, data);

      // Return a simulated provider message ID
      const mockId = `sms_msg_${Math.random().toString(36).substring(2, 11)}`;
      
      return {
        success: true,
        providerMessageId: mockId,
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

