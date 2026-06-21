import { z } from "zod";

export const ProviderConfigSchema = z.object({
  channel: z.enum(["EMAIL", "SMS", "WEBHOOK", "IN_APP"]),
  provider: z.string().min(1, "Provider name is required"),
  apiKey: z.string().min(1, "API Key is required"),
  config: z.record(z.string()).optional().default({}),
});

export type ProviderConfigInput = z.infer<typeof ProviderConfigSchema>;
