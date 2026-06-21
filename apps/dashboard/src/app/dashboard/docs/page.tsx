"use client";

import React, { useState } from "react";
import { BookOpen, Terminal, ShieldAlert, Key, Copy, Check, Info } from "lucide-react";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"email" | "sms" | "webhook" | "inapp">("email");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const cUrlAuthExample = `curl -X POST ${apiBaseUrl}/api/v1/notify \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: nf_your_api_key_here" \\
  -d '{ ... }'`;

  const webhookVerifyNodeCode = `import crypto from "crypto";

// Express.js route handler
app.post("/webhooks/notifyflow", (req, res) => {
  const signature = req.headers["x-notifyflow-signature"];
  const payloadString = JSON.stringify(req.body);
  const secret = process.env.NOTIFYFLOW_WEBHOOK_SECRET;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadString)
    .digest("hex");

  if (signature === expectedSignature) {
    console.log("Webhook verified securely!");
    res.status(200).send("Verified");
  } else {
    console.warn("Invalid signature. Rejecting request.");
    res.status(401).send("Unauthorized");
  }
});`;

  const emailPayload = `{
  "recipient": "customer@example.com",
  "channel": "EMAIL",
  "templateName": "welcome_customer",
  "data": {
    "name": "John Doe",
    "company": "Acme Corp"
  },
  "priority": "HIGH"
}`;

  const smsPayload = `{
  "recipient": "+15555555555",
  "channel": "SMS",
  "templateName": "verification_code",
  "data": {
    "code": "482910"
  },
  "priority": "HIGH"
}`;

  const webhookPayload = `{
  "recipient": "https://api.mycompany.com/webhooks/notifyflow",
  "channel": "WEBHOOK",
  "templateName": "order_shipped",
  "data": {
    "orderId": "ORD-9988",
    "carrier": "FedEx",
    "trackingNumber": "1234567890"
  },
  "priority": "DEFAULT"
}`;

  const inappPayload = `{
  "recipient": "user_stark_991",
  "channel": "IN_APP",
  "templateName": "billing_invoice",
  "data": {
    "invoiceAmount": "$49.00",
    "dueDate": "June 30, 2026"
  },
  "priority": "DEFAULT"
}`;

  const apiResponseExample = `{
  "notification_id": "8c2af819-df09-4bf1-a7b3-887cc399a099",
  "notificationId": "8c2af819-df09-4bf1-a7b3-887cc399a099",
  "status": "queued"
}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#1C1917] select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#F1EDE9] pb-5 gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1C1917] tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#78716C]" />
            Developer Documentation
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            Learn how to integrate the Notifyflow API, configure BYOK pipelines, and securely ingest feeds
          </p>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Intro */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-[#F1EDE9] bg-white p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
              <Terminal className="h-4.5 w-4.5 text-[#78716C]" />
              1. Quick Start Integration
            </h2>
            <p className="text-xs text-[#78716C] leading-relaxed">
              All delivery requests are validated in real-time and pushed into our high-performance BullMQ pipeline.
              To call the API, request authorization using the <code className="text-[#E11D48] font-mono px-1 py-0.5 bg-[#FFF1F2] border border-[#FB7185]/20 rounded font-semibold">x-api-key</code> HTTP header.
            </p>

            <div className="relative">
              <div className="absolute right-3 top-3 z-10">
                <button
                  onClick={() => handleCopy(cUrlAuthExample, "curl-auth")}
                  className="text-[#78716C] hover:text-[#1C1917] p-2 rounded bg-white border border-[#F1EDE9] shadow-sm transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="Copy curl"
                >
                  {copiedText === "curl-auth" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <pre className="rounded-lg bg-[#1C1917] border border-[#F1EDE9] p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed">
                {cUrlAuthExample}
              </pre>
            </div>
          </div>

          <div className="rounded-xl border border-[#F1EDE9] bg-white p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#1C1917] flex items-center gap-2">
              <Key className="h-4.5 w-4.5 text-[#78716C]" />
              2. Bring Your Own Keys (BYOK)
            </h2>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Instead of using a global Resend/Twilio gateway, Notifyflow runs entirely on tenant-level credentials.
              Before dispatching messages via <strong>EMAIL</strong> or <strong>SMS</strong>, you must navigate to the
              <code className="text-[#E11D48] font-mono px-1 py-0.5 bg-[#FFF1F2] border border-[#FB7185]/20 rounded font-semibold">Providers</code> view and save your private keys.
            </p>
            <div className="flex items-start gap-3 rounded-lg border border-[#FEF3C7] bg-[#FEF3C7]/40 p-4 text-xs text-[#B45309]">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-[#B45309]" />
              <p className="text-xs leading-relaxed text-[#78716C]">
                <strong className="text-[#B45309] font-bold">Strict Guardrails:</strong> If you call the ingestion API on a channel that lacks a configured credentials block, the server rejects it early with a <code className="text-[#BE123C] font-semibold bg-[#FFF1F2] px-1 rounded">422 Unprocessable Entity</code> response to prevent dead jobs.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#F1EDE9] bg-white p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">Base Configurations</h3>
            <div className="space-y-3 font-mono text-[11px] leading-relaxed">
              <div className="space-y-1">
                <span className="text-[#78716C] uppercase font-bold text-[10px]">API Server Target</span>
                <p className="text-[#1C1917] font-semibold select-all break-all">{apiBaseUrl}</p>
              </div>
              <div className="space-y-1 border-t border-[#F1EDE9] pt-3">
                <span className="text-[#78716C] uppercase font-bold text-[10px]">Default Queue Retries</span>
                <p className="text-[#1C1917] font-semibold">4 Attempts (Exponential backoff)</p>
              </div>
              <div className="space-y-1 border-t border-[#F1EDE9] pt-3">
                <span className="text-[#78716C] uppercase font-bold text-[10px]">Authentication Header</span>
                <p className="text-[#1C1917] font-semibold">x-api-key: nf_your_key_here</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#F1EDE9] bg-white p-6 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-4 w-4 text-[#78716C]" />
              Ingestion Limits
            </h3>
            <p className="text-xs text-[#78716C] leading-normal">
              Rate limiting is enforced per-tenant using a sliding-window algorithm. The default ceiling allows up to <strong>100 requests per 10-second window</strong>. Excess calls receive an HTTP 429 response.
            </p>
          </div>
        </div>
      </div>

      {/* Payload and Channel Spec Section */}
      <div className="rounded-xl border border-[#F1EDE9] bg-white p-6 space-y-6 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#1C1917]">
            3. Channel Ingestion Payloads
          </h2>
          <p className="text-xs text-[#78716C] mt-1">
            Toggle tabs below to explore Zod-validated body shapes for <code className="text-[#78716C] bg-[#FAF9F7] px-1 rounded font-mono font-semibold">POST /api/v1/notify</code>
          </p>
        </div>

        {/* Tab Headers: scrollable on mobile */}
        <div className="flex border-b border-[#F1EDE9] overflow-x-auto whitespace-nowrap scrollbar-none">
          {(["email", "sms", "webhook", "inapp"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px min-h-[44px] ${
                activeTab === tab
                  ? "border-[#E11D48] text-[#E11D48]"
                  : "border-transparent text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              {tab === "inapp" ? "In-App" : tab}
            </button>
          ))}
        </div>

        {/* Tab Panels: Stack on mobile, side by side on md */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* JSON Body */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-[#78716C] tracking-wider">Request JSON Payload</span>
              <button
                onClick={() => {
                  const payload =
                    activeTab === "email"
                      ? emailPayload
                      : activeTab === "sms"
                      ? smsPayload
                      : activeTab === "webhook"
                      ? webhookPayload
                      : inappPayload;
                  handleCopy(payload, `payload-${activeTab}`);
                }}
                className="text-[#78716C] hover:text-[#E11D48] flex items-center gap-1.5 text-[11px] font-bold min-h-[36px]"
              >
                {copiedText === `payload-${activeTab}` ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy Payload
                  </>
                )}
              </button>
            </div>
            <pre className="rounded-lg bg-[#1C1917] border border-[#F1EDE9] p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed">
              {activeTab === "email" && emailPayload}
              {activeTab === "sms" && smsPayload}
              {activeTab === "webhook" && webhookPayload}
              {activeTab === "inapp" && inappPayload}
            </pre>
          </div>

          {/* Response Payload */}
          <div className="space-y-3">
            <div className="flex items-center min-h-[36px]">
              <span className="text-[10px] font-bold uppercase text-[#78716C] tracking-wider block">API Response (202 Accepted)</span>
            </div>
            <pre className="rounded-lg bg-[#1C1917] border border-[#F1EDE9] p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed">
              {apiResponseExample}
            </pre>
          </div>
        </div>
      </div>

      {/* Advanced Topics (Webhooks Signature / Inapp Reading) */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Webhooks Signature verification */}
        <div className="rounded-xl border border-[#F1EDE9] bg-white p-6 space-y-4 shadow-sm">
          <div>
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">4. Webhook Signature Verification</h3>
            <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
              Every Webhook POST is signed using the shared tenant webhook secret in the header <code className="text-[#E11D48] font-mono font-semibold bg-[#FFF1F2] px-1 rounded">x-notifyflow-signature</code>. Confirm this hash on your server to avoid spoofing.
            </p>
          </div>

          <div className="relative">
            <div className="absolute right-3 top-3 z-10">
              <button
                onClick={() => handleCopy(webhookVerifyNodeCode, "webhook-verify")}
                className="text-[#78716C] hover:text-[#1C1917] p-2 rounded bg-white border border-[#F1EDE9] shadow-sm transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Copy snippet"
              >
                {copiedText === "webhook-verify" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <pre className="rounded-lg bg-[#1C1917] border border-[#F1EDE9] p-4 font-mono text-[10px] text-zinc-300 overflow-x-auto max-h-[250px] leading-relaxed">
              {webhookVerifyNodeCode}
            </pre>
          </div>
        </div>

        {/* In-App consumption specifications */}
        <div className="rounded-xl border border-[#F1EDE9] bg-white p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">5. Consuming In-App Notifications</h3>
              <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
                Render notification bell menus in your client applications by calling database repository query models.
              </p>
            </div>

            <div className="space-y-3 font-mono text-[10px]">
              <div className="space-y-1.5">
                <span className="text-[#78716C] uppercase font-bold text-[9px]">SQL Query to fetch unread items</span>
                <pre className="bg-[#1C1917] p-2.5 border border-[#F1EDE9] rounded text-zinc-300 select-all leading-normal overflow-x-auto font-mono">
{`SELECT id, title, body, created_at 
FROM inapp_notifications 
WHERE tenant_id = 'your-tenant-id' 
  AND recipient_id = 'user-id-here' 
  AND read = false 
ORDER BY created_at DESC;`}
                </pre>
              </div>

              <div className="space-y-1.5">
                <span className="text-[#78716C] uppercase font-bold text-[9px]">SQL Command to mark as read</span>
                <pre className="bg-[#1C1917] p-2.5 border border-[#F1EDE9] rounded text-zinc-300 select-all leading-normal overflow-x-auto font-mono">
{`UPDATE inapp_notifications 
SET read = true, read_at = NOW() 
WHERE id = 'notification-id-here';`}
                </pre>
              </div>
            </div>
          </div>

          <div className="border-t border-[#F1EDE9] pt-4 text-[10px] text-[#78716C] font-semibold leading-relaxed">
            💡 For real-time updates, developers can stream database state notifications using native client pub/sub patterns.
          </div>
        </div>
      </div>
    </div>
  );
}
