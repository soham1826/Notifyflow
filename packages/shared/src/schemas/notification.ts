import { z } from "zod";

export const NotifyRequestSchema = z.object({
  recipient: z.string().min(1, "Recipient is required"),
  channel: z.enum(["EMAIL", "WEBHOOK", "IN_APP", "SMS"]),
  templateName: z.string().optional(),
  rawSubject: z.string().optional(),
  rawBody: z.string().optional(),
  data: z.record(z.union([z.string(), z.number(), z.boolean()])).optional().default({}),
  priority: z.enum(["HIGH", "DEFAULT", "BULK"]).optional().default("DEFAULT"),
}).refine(
  (data) => {
    // If channel is WEBHOOK, recipient must be a valid URL
    if (data.channel === "WEBHOOK") {
      return z.string().url().safeParse(data.recipient).success;
    }
    return true;
  },
  {
    message: "Recipient must be a valid URL when channel is WEBHOOK",
    path: ["recipient"]
  }
).refine(
  (data) => {
    // If templateName is present, it is valid (it will be merged server-side).
    if (data.templateName && data.templateName.trim().length > 0) {
      return true;
    }
    // If templateName is missing, rawBody is mandatory.
    if (!data.rawBody || data.rawBody.trim().length === 0) {
      return false;
    }
    // If templateName is missing and channel is EMAIL, rawSubject is also mandatory.
    if (data.channel === "EMAIL") {
      return !!data.rawSubject && data.rawSubject.trim().length > 0;
    }
    return true;
  },
  {
    message: "Either 'templateName' must be provided, or 'rawBody' (along with 'rawSubject' for EMAIL channel) must be provided.",
    path: ["templateName", "rawBody", "rawSubject"]
  }
);

export type NotifyRequestInput = z.infer<typeof NotifyRequestSchema>;

export interface NotifyResponse {
  notificationId: string;
  status: "queued";
}
