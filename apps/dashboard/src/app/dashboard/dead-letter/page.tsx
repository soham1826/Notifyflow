"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface Attempt {
  error: string | null;
}

interface FailedNotification {
  id: string;
  recipient: string;
  channel: "EMAIL" | "SMS" | "WEBHOOK" | "IN_APP";
  createdAt: string;
  attempts: Attempt[];
}

export default function DeadLetterQueuePage() {
  const [notifications, setNotifications] = useState<FailedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch dead-letter notifications
  async function fetchFailedNotifications() {
    try {
      setLoading(true);
      const data = await apiClient.get("/api/v1/notifications?status=FAILED&limit=100");
      setNotifications(data.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load dead-letter queue list.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFailedNotifications();
  }, []);

  // Execute manual retry
  async function handleRetry(id: string) {
    setRetryingIds((prev) => new Set([...prev, id]));
    setSuccessMessage(null);
    setError(null);

    try {
      await apiClient.post(`/api/v1/notifications/${id}/retry`);
      setSuccessMessage(`Notification ${id.substring(0, 8)}... successfully re-queued.`);
      await fetchFailedNotifications();
    } catch (err: any) {
      setError(err.message || "Retry request failed.");
    } finally {
      setRetryingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#1C1917] select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#F1EDE9] pb-5 gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1C1917] tracking-tight flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-[#E11D48]" />
            Dead-Letter Queue (DLQ)
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            Review and retry permanently failed notifications (exhausted all 4 delivery attempts)
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-4 text-xs text-[#BE123C]">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4 text-xs text-[#15803D] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Dataset Log */}
      <div className="rounded-xl border border-[#F1EDE9] bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-[#78716C] text-xs">
            Loading dead-letter records...
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-[#F1EDE9]">
            {notifications.map((n) => {
              const latestError = n.attempts && n.attempts[0] ? n.attempts[0].error : "Unknown processing error";
              const isRetrying = retryingIds.has(n.id);

              return (
                <div
                  key={n.id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#FAF9F7] transition-colors"
                >
                  <div className="space-y-3 flex-1 overflow-hidden">
                    {/* Header line */}
                    <div className="flex flex-wrap items-center gap-2.5 text-xs">
                      <span className="font-mono text-[10px] text-[#78716C] bg-[#FAF9F7] px-2 py-0.5 rounded border border-[#F1EDE9]">
                        {n.id}
                      </span>
                      <span className="font-mono font-bold text-[#E11D48] bg-[#FFF1F2] px-2 py-0.5 rounded border border-[#FB7185]/20">
                        {n.channel}
                      </span>
                      <span className="text-[#1C1917] font-semibold truncate max-w-xs" title={n.recipient}>
                        {n.recipient}
                      </span>
                    </div>

                    {/* Error block */}
                    <div className="rounded-lg border border-[#FFF1F2] bg-[#FFF1F2]/50 p-3 flex gap-2">
                      <AlertTriangle className="h-4 w-4 text-[#BE123C] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#BE123C]">LAST ATTEMPT ERROR</span>
                        <p className="font-mono text-[11px] text-[#BE123C] break-all">{latestError}</p>
                      </div>
                    </div>

                    <span className="block font-mono text-[10px] text-[#78716C]">
                      Dispatched At: {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center w-full md:w-auto">
                    <button
                      onClick={() => handleRetry(n.id)}
                      disabled={isRetrying}
                      className="flex w-full md:w-auto items-center justify-center gap-2 rounded-lg border border-[#F1EDE9] bg-[#FAF9F7] hover:bg-[#F1EDE9] hover:text-[#1C1917] px-4 py-2.5 text-xs font-semibold text-[#78716C] transition-colors disabled:opacity-50 outline-none min-h-[44px]"
                    >
                      <RotateCcw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
                      {isRetrying ? "Retrying..." : "Retry Dispatch"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <CheckCircle2 className="h-10 w-10 text-[#78716C]" />
            <div className="text-center space-y-1">
              <h3 className="text-sm font-semibold text-[#1C1917]">Clean Slate</h3>
              <p className="text-xs text-[#78716C]">No permanently failed notifications found in your queue.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
