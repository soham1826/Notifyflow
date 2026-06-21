"use client";

import React, { useEffect, useState } from "react";
import { Key, Copy, Check, RefreshCw, Eye, EyeOff, Sliders, ShieldCheck } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface Tenant {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Webhook Signing Secret state
  const [webhookSecret, setWebhookSecret] = useState("");
  const [webhookSecretMasked, setWebhookSecretMasked] = useState<string | null>(null);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const [webhookSuccess, setWebhookSuccess] = useState<string | null>(null);

  useEffect(() => {
    const tenantInfo = localStorage.getItem("nf_tenant_info");
    if (tenantInfo) {
      try {
        setTenant(JSON.parse(tenantInfo));
      } catch (e) {
        console.error("Failed to parse tenant info from localStorage");
      }
    }

    fetchWebhookSecret();
  }, []);

  async function fetchWebhookSecret() {
    try {
      const configs = await apiClient.get("/api/v1/providers");
      const webhookConfig = configs.find((c: { channel: string; apiKey: string }) => c.channel === "WEBHOOK");
      if (webhookConfig) {
        setWebhookSecretMasked(webhookConfig.apiKey); // Already masked from API
        setWebhookSecret(webhookConfig.apiKey); // Pre-fill with masked value
      }
    } catch {
      // Ignore silently — no webhook config yet
    }
  }

  function handleCopy() {
    if (!tenant) return;
    navigator.clipboard.writeText(tenant.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerateKey() {
    if (!confirm("Are you sure you want to regenerate your API Key? Any requests currently using your old key will immediately fail.")) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await apiClient.post("/api/v1/auth/regenerate-key");
      if (tenant) {
        const updatedTenant = { ...tenant, apiKey: data.apiKey };
        setTenant(updatedTenant);
        localStorage.setItem("nf_tenant_info", JSON.stringify(updatedTenant));
      }

      setSuccess("Your API key was regenerated successfully.");
      setShowKey(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to regenerate API Key.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveWebhookSecret(e: React.FormEvent) {
    e.preventDefault();
    if (!webhookSecret || webhookSecret.includes("••")) {
      setWebhookError("Please enter a new plaintext signing secret to save.");
      return;
    }

    setWebhookLoading(true);
    setWebhookError(null);
    setWebhookSuccess(null);

    try {
      const data = await apiClient.post("/api/v1/providers", {
        channel: "WEBHOOK",
        provider: "custom",
        apiKey: webhookSecret,
        config: {},
      });

      setWebhookSecretMasked(data.apiKey);
      setWebhookSecret(data.apiKey); // Show masked value in field
      setWebhookSuccess("Webhook signing secret saved successfully. Share this secret with your server to verify webhook signatures.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setWebhookError(msg || "Failed to save webhook signing secret.");
    } finally {
      setWebhookLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto font-sans text-[#1C1917] select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#F1EDE9] pb-5 gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1C1917] tracking-tight flex items-center gap-2">
            <Sliders className="h-5 w-5 text-[#78716C]" />
            Settings
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            Manage your API credentials and account details
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-4 text-xs text-[#BE123C]">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4 text-xs text-[#15803D]">
          {success}
        </div>
      )}

      {/* Account Info */}
      <div className="rounded-xl border border-[#F1EDE9] bg-white p-6 space-y-4 shadow-sm">
        <h2 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">Account Specifications</h2>
        
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 text-xs">
          <div className="space-y-1">
            <span className="text-[#78716C] text-[10px] uppercase font-bold">Tenant Name</span>
            <p className="text-[#1C1917] font-semibold">{tenant ? tenant.name : "..."}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[#78716C] text-[10px] uppercase font-bold">Registered Email</span>
            <p className="text-[#1C1917] font-semibold">{tenant ? tenant.email : "..."}</p>
          </div>
        </div>
      </div>

      {/* API Key Panel */}
      <div className="rounded-xl border border-[#F1EDE9] bg-white p-6 space-y-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">Public API Key</h2>
          <p className="text-xs text-[#78716C] leading-normal">
            Use this secret key to authenticate your delivery requests via the `x-api-key` request header.
          </p>
        </div>

        {tenant && (
          <div className="space-y-4">
            {/* Key Field with actions */}
            <div className="flex items-center space-x-2 rounded-lg border border-[#F1EDE9] bg-[#FAF9F7] p-3 font-mono text-xs">
              <Key className="h-4 w-4 text-[#78716C] shrink-0" />
              <input
                type={showKey ? "text" : "password"}
                readOnly
                value={tenant.apiKey}
                className="bg-transparent text-[#1C1917] outline-none flex-1 font-mono tracking-wider overflow-ellipsis text-[11px]"
              />
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="text-[#78716C] hover:text-[#1C1917] p-2 rounded hover:bg-[#F1EDE9] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title={showKey ? "Hide API Key" : "Show API Key"}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleCopy}
                  className="text-[#78716C] hover:text-[#1C1917] p-2 rounded hover:bg-[#F1EDE9] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="Copy API Key"
                >
                  {copied ? <Check className="h-4 w-4 text-[#15803D]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Rotation Panel Warning */}
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="flex flex-col space-y-1 text-xs">
                  <span className="font-bold text-[#B45309]">Rotating API Credentials</span>
                  <p className="text-xs text-[#78716C] leading-normal">
                    When you regenerate the API key, the existing key will be permanently invalidated immediately. All external systems transmitting calls using the old key will get blocked responses.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleRegenerateKey}
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-[#F1EDE9] bg-[#FAF9F7] hover:bg-[#F1EDE9] text-[#1C1917] px-4 py-2.5 text-xs font-semibold transition-colors disabled:opacity-50 outline-none min-h-[44px]"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  Regenerate Credentials
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Webhook Signing Secret Panel */}
      <div className="rounded-xl border border-[#F1EDE9] bg-white p-6 space-y-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#78716C]" />
            Webhook Signing Secret
          </h2>
          <p className="text-xs text-[#78716C] leading-relaxed">
            This per-tenant secret is used to sign all outbound webhook payloads via HMAC-SHA256.
            Share this value with your server to verify that webhook requests originated from Notifyflow.
          </p>
        </div>

        {webhookError && (
          <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-3 text-xs text-[#BE123C]">
            {webhookError}
          </div>
        )}

        {webhookSuccess && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-[#15803D]">
            {webhookSuccess}
          </div>
        )}

        <form onSubmit={handleSaveWebhookSecret} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider">
                Signing Secret
              </label>
              {webhookSecretMasked && (
                <span className="text-[9px] text-[#B45309] font-bold">Currently Encrypted</span>
              )}
            </div>
            <input
              type="password"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="Enter a random signing secret (e.g. whs_••••••••••••)"
              className="w-full rounded-lg border border-[#F1EDE9] bg-white p-2.5 font-mono text-xs text-[#1C1917] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] min-h-[44px]"
            />
            {webhookSecret.includes("••") && (
              <p className="text-[9px] text-[#78716C] leading-relaxed">
                ℹ️ Leaving this as-is preserves the existing encrypted secret. Enter a new value to replace it.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <p className="text-[10px] text-[#78716C] leading-relaxed">
              Incoming webhook requests will include the header{" "}
              <code className="font-mono text-[#E11D48] bg-[#FFF1F2] px-1 py-0.5 rounded">x-notifyflow-signature</code>.
            </p>
            <button
              type="submit"
              disabled={webhookLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white px-4 py-2.5 text-xs font-semibold transition-colors disabled:opacity-50 outline-none min-h-[44px]"
            >
              <ShieldCheck className={`h-3.5 w-3.5 ${webhookLoading ? "animate-pulse" : ""}`} />
              {webhookLoading ? "Saving..." : "Save Secret"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
