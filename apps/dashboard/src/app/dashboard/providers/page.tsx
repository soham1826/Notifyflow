"use client";

import React, { useEffect, useState } from "react";
import { Globe, Shield, Play, Trash2, Edit3, X, Check, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface ProviderConfig {
  id: string;
  tenantId: string;
  channel: "EMAIL" | "SMS" | "WEBHOOK" | "IN_APP";
  provider: string;
  apiKey: string;
  config: Record<string, string>;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProvidersPage() {
  const [configs, setConfigs] = useState<ProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<"EMAIL" | "SMS" | "WEBHOOK" | "IN_APP" | null>(null);
  const [provider, setProvider] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Testing State
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  // Fetch all configured providers
  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get("/api/v1/providers");
      setConfigs(data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // Open modal with existing data loaded
  const handleOpenConfigure = (channel: "EMAIL" | "SMS" | "WEBHOOK" | "IN_APP") => {
    const existing = configs.find((c) => c.channel === channel);
    setActiveChannel(channel);
    setTestResult(null);

    if (existing) {
      setProvider(existing.provider);
      setApiKey(existing.apiKey); // Masked value
      setFromName(existing.config.fromName || "");
      setFromEmail(existing.config.fromEmail || "");
    } else {
      if (channel === "EMAIL") {
        setProvider("resend");
      } else if (channel === "SMS") {
        setProvider("mock");
      } else if (channel === "WEBHOOK") {
        setProvider("custom");
      } else {
        setProvider("database");
      }
      setApiKey("");
      setFromName("");
      setFromEmail("");
    }

    setIsModalOpen(true);
  };

  // Submit configuration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChannel) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const extraConfig: Record<string, string> = {};
    if (activeChannel === "EMAIL") {
      if (fromName) extraConfig.fromName = fromName;
      if (fromEmail) extraConfig.fromEmail = fromEmail;
    }

    try {
      await apiClient.post("/api/v1/providers", {
        channel: activeChannel,
        provider,
        apiKey,
        config: extraConfig,
      });

      setSuccess(`Successfully configured ${activeChannel} provider.`);
      setIsModalOpen(false);
      fetchConfigs();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Test configured provider
  const handleTestConnection = async (channel: "EMAIL" | "SMS" | "WEBHOOK" | "IN_APP") => {
    setTestingChannel(channel);
    setTestResult(null);

    try {
      const result = await apiClient.post(`/api/v1/providers/${channel}/test`);
      setTestResult(result);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setTestResult({ success: false, error: errorMsg });
    } finally {
      setTestingChannel(null);
    }
  };

  // Delete configured provider
  const handleDelete = async (channel: "EMAIL" | "SMS" | "WEBHOOK" | "IN_APP") => {
    if (!confirm(`Are you sure you want to remove the provider configuration for ${channel}?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await apiClient.delete(`/api/v1/providers/${channel}`);
      setSuccess(`Provider configuration for ${channel} deleted.`);
      fetchConfigs();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
    }
  };

  const channelsInfo = [
    {
      id: "EMAIL" as const,
      name: "Email Delivery",
      description: "Send transactional and lifecycle emails using your own Resend API key. Requires a verified sending domain on Resend for delivery to arbitrary recipients.",
      icon: Globe,
      allowedProviders: ["resend"],
    },
    {
      id: "SMS" as const,
      name: "SMS Dispatch",
      description: "Transmit text messages to mobile phone lines globally using Twilio or a compatible SMS gateway. Enter your Twilio Auth Token as the API Key.",
      icon: Shield,
      allowedProviders: ["twilio", "mock"],
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#1C1917] select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#F1EDE9] pb-5 gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1C1917] tracking-tight flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#78716C]" />
            BYOK Providers
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            Configure tenant-level custom API keys and integrations for notification channels
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

      {/* Test result display */}
      {testResult && (
        <div
          className={`rounded-lg border p-4 text-xs flex items-start gap-3 ${
            testResult.success
              ? "border-emerald-100 bg-emerald-50/50 text-[#15803D]"
              : "border-rose-100 bg-rose-50/50 text-[#BE123C]"
          }`}
        >
          {testResult.success ? (
            <Check className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <span className="font-bold">{testResult.success ? "Test Succeeded!" : "Test Failed"}</span>
            <p className="text-xs opacity-90 leading-relaxed">
              {testResult.success
                ? "The connection test completed. If using EMAIL, inspect your tenant email inbox for a test notification."
                : testResult.error || "An unknown provider error occurred during transmission."}
            </p>
          </div>
          <button
            onClick={() => setTestResult(null)}
            className="ml-auto text-[#78716C] hover:text-[#1C1917] p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Cards Grid: single column on mobile, 2 columns on tablet/desktop */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {channelsInfo.map((info) => {
          const config = configs.find((c) => c.channel === info.id);
          const Icon = info.icon;

          return (
            <div
              key={info.id}
              className="rounded-xl border border-[#F1EDE9] bg-white p-6 flex flex-col justify-between space-y-6 shadow-sm"
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAF9F7] border border-[#F1EDE9] text-[#78716C]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1C1917]">{info.name}</h3>
                      <span className="text-[9px] font-mono text-[#78716C] font-semibold uppercase tracking-wider">{info.id}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {config && config.enabled ? (
                    <span className="inline-flex items-center gap-1 rounded bg-[#DCFCE7] px-2.5 py-0.5 text-[9px] font-bold text-[#15803D] border border-[#DCFCE7]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#15803D]" />
                      Configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-[#F1F5F9] px-2.5 py-0.5 text-[9px] font-bold text-[#475569] border border-[#F1F5F9]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#475569]" />
                      Not Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#78716C] leading-relaxed">
                  {info.description}
                </p>

                {/* Configuration details if present */}
                {config && (
                  <div className="rounded-lg bg-[#FAF9F7] border border-[#F1EDE9] p-3.5 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#78716C]">Provider:</span>
                      <span className="text-[#1C1917] font-bold uppercase">{config.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#78716C]">API Key:</span>
                      <span className="text-[#78716C] overflow-ellipsis max-w-[180px] truncate" title={config.apiKey}>{config.apiKey}</span>
                    </div>
                    {config.channel === "EMAIL" && (
                      <>
                        {config.config.fromName && (
                          <div className="flex justify-between">
                            <span className="text-[#78716C]">Sender Name:</span>
                            <span className="text-[#1C1917] font-semibold">{config.config.fromName}</span>
                          </div>
                        )}
                        {config.config.fromEmail && (
                          <div className="flex justify-between">
                            <span className="text-[#78716C]">Sender Email:</span>
                            <span className="text-[#1C1917] font-semibold">{config.config.fromEmail}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F1EDE9]">
                <button
                  onClick={() => handleOpenConfigure(info.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-[#F1EDE9] bg-[#FAF9F7] hover:bg-[#F1EDE9] text-[#1C1917] hover:text-[#1C1917] px-3 py-2.5 text-xs font-semibold transition-colors outline-none min-h-[44px]"
                >
                  <Edit3 className="h-4 w-4" />
                  {config ? "Modify" : "Configure"}
                </button>

                {config && (
                  <>
                    <button
                      onClick={() => handleTestConnection(info.id)}
                      disabled={testingChannel === info.id}
                      className="flex items-center justify-center rounded-lg border border-[#F1EDE9] bg-[#FAF9F7] hover:bg-[#F1EDE9] text-[#78716C] hover:text-[#1C1917] p-2.5 text-xs font-semibold transition-colors outline-none disabled:opacity-50 min-w-[44px] min-h-[44px]"
                      title="Test Connection"
                    >
                      <Play className={`h-4 w-4 ${testingChannel === info.id ? "animate-pulse text-[#E11D48]" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(info.id)}
                      className="flex items-center justify-center rounded-lg border border-[#FFF1F2] bg-[#FFF1F2] hover:bg-[#FFF1F2] text-[#BE123C] p-2.5 text-xs font-semibold transition-colors outline-none min-w-[44px] min-h-[44px]"
                      title="Remove Configuration"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal: full-screen on mobile, centered modal on desktop */}
      {isModalOpen && activeChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 backdrop-blur-sm bg-[#1C1917]/30">
          <div className="w-full h-full sm:h-auto sm:max-w-md rounded-none sm:rounded-xl border border-[#F1EDE9] bg-white p-6 space-y-6 shadow-2xl overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#F1EDE9] pb-4">
              <div>
                <h2 className="text-sm font-bold text-[#1C1917]">
                  Configure {activeChannel} Provider
                </h2>
                <p className="text-[10px] text-[#78716C] mt-0.5 font-semibold">
                  Set up your dynamic API credentials for client dispatch
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#78716C] hover:text-[#1C1917] p-2 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full rounded-lg border border-[#F1EDE9] bg-[#FAF9F7] p-2.5 text-xs text-[#1C1917] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] min-h-[44px] cursor-pointer"
                  required
                >
                  {activeChannel === "EMAIL" && <option value="resend">Resend</option>}
                  {activeChannel === "SMS" && (
                    <>
                      <option value="mock">Mock Simulator</option>
                      <option value="twilio">Twilio SMS</option>
                    </>
                  )}
                  {activeChannel === "WEBHOOK" && <option value="custom">Custom Webhook Signature</option>}
                  {activeChannel === "IN_APP" && <option value="database">Database Repository</option>}
                </select>
              </div>

              {/* API Key */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider">API Key / Secret</label>
                  {apiKey.includes("••") && (
                    <span className="text-[9px] text-[#B45309] font-bold">Currently Encrypted</span>
                  )}
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API secret key"
                  className="w-full rounded-lg border border-[#F1EDE9] bg-white p-2.5 font-mono text-xs text-[#1C1917] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] min-h-[44px]"
                  required
                />
                {apiKey.includes("••") && (
                  <p className="text-[9px] text-[#78716C] leading-relaxed mt-1">
                    ℹ️ Leaving this as-is preserves the existing encrypted credential in the database. Enter a new key only to replace it.
                  </p>
                )}
              </div>

              {/* Extra configuration inputs (EMAIL specific) */}
              {activeChannel === "EMAIL" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider">Sender Name</label>
                    <input
                      type="text"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full rounded-lg border border-[#F1EDE9] bg-white p-2.5 text-xs text-[#1C1917] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider">Sender Email</label>
                    <input
                      type="email"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      placeholder="e.g. onboarding@resend.dev"
                      className="w-full rounded-lg border border-[#F1EDE9] bg-white p-2.5 text-xs text-[#1C1917] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] min-h-[44px]"
                    />
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-4 border-t border-[#F1EDE9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto rounded-lg border border-[#F1EDE9] px-4 py-2.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] active:bg-[#FAF9F7] transition-colors outline-none min-h-[44px] flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto rounded-lg bg-[#E11D48] hover:bg-[#BE123C] px-4 py-2.5 text-xs font-semibold text-white transition-colors outline-none disabled:opacity-50 min-h-[44px] flex items-center justify-center"
                >
                  {submitting ? "Saving..." : "Save Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
