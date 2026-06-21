"use client";

import React, { useEffect, useState } from "react";
import { Activity, Bell, CheckCircle2, XCircle, Zap } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface Stats {
  total: number;
  statusCounts: {
    QUEUED: number;
    PROCESSING: number;
    DELIVERED: number;
    FAILED: number;
    RETRYING: number;
  };
  channelCounts: {
    EMAIL: number;
    SMS: number;
    WEBHOOK: number;
    IN_APP: number;
  };
  successRate: number;
  failedRate: number;
}

interface LiveEvent {
  notificationId: string;
  status: "QUEUED" | "PROCESSING" | "DELIVERED" | "RETRYING" | "FAILED";
  channel: "EMAIL" | "SMS" | "WEBHOOK" | "IN_APP";
  recipient: string;
  error: string | null;
  timestamp: number;
}

export default function OverviewPage() {
  const [range, setRange] = useState<"all" | "today">("all");
  const [stats, setStats] = useState<Stats | null>(null);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Fetch summary statistics
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await apiClient.get(`/api/v1/dashboard/stats?range=${range}`);
        setStats(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [range]);

  // Connect to SSE stream
  useEffect(() => {
    const token = localStorage.getItem("nf_dashboard_token");
    if (!token) return;

    const eventSource = new EventSource(`${apiBaseUrl}/api/v1/dashboard/stream?token=${token}`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === "connected") {
          console.log("[SSE] Connected. Handshake complete.");
          return;
        }

        setLiveEvents((prev) => {
          const filtered = prev.filter((item) => item.notificationId !== payload.notificationId);
          return [payload, ...filtered].slice(0, 10);
        });

        refreshStatsInBackground();
      } catch (err) {
        console.error("[SSE] Failed to parse message:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("[SSE] Stream encountered error:", err);
    };

    return () => {
      eventSource.close();
    };
  }, [apiBaseUrl]);

  async function refreshStatsInBackground() {
    try {
      const data = await apiClient.get(`/api/v1/dashboard/stats?range=${range}`);
      setStats(data);
    } catch {
      // Ignore background refresh errors
    }
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case "DELIVERED":
        return "bg-[#DCFCE7] text-[#15803D] border-[#DCFCE7]";
      case "RETRYING":
        return "bg-[#FEF3C7] text-[#B45309] border-[#FEF3C7]";
      case "FAILED":
        return "bg-[#FFF1F2] text-[#BE123C] border-[#FFF1F2]";
      case "PROCESSING":
        return "bg-[#EFF6FF] text-[#1D4ED8] border-[#EFF6FF]";
      case "QUEUED":
      default:
        return "bg-[#F1F5F9] text-[#475569] border-[#F1F5F9]";
    }
  }

  const activeQueueCount = stats
    ? stats.statusCounts.QUEUED + stats.statusCounts.PROCESSING + stats.statusCounts.RETRYING
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#1C1917] select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#F1EDE9] pb-5 gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1C1917] tracking-tight">
            Overview
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            Real-time pipeline metrics and activity feeds
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center self-start sm:self-auto space-x-1 rounded-lg border border-[#F1EDE9] bg-[#FAF9F7] p-1">
          <button
            onClick={() => setRange("all")}
            className={`rounded-md px-3 py-1 text-[11px] font-semibold transition-colors min-h-[32px] ${
              range === "all"
                ? "bg-[#E11D48] text-white"
                : "text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            All-Time
          </button>
          <button
            onClick={() => setRange("today")}
            className={`rounded-md px-3 py-1 text-[11px] font-semibold transition-colors min-h-[32px] ${
              range === "today"
                ? "bg-[#E11D48] text-white"
                : "text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            Today (UTC)
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-4 text-xs text-[#BE123C]">
          {error}
        </div>
      )}

      {/* Metric Cards Grid - 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sent */}
        <div className="rounded-xl border border-[#F1EDE9] bg-white p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Dispatched</span>
            <Bell className="h-4 w-4 text-[#78716C]" />
          </div>
          <div>
            <span className="text-2xl font-bold text-[#1C1917] tracking-tight">
              {loading ? "..." : stats?.total ?? 0}
            </span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="rounded-xl border border-[#F1EDE9] bg-white p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Delivery Rate</span>
            <CheckCircle2 className="h-4 w-4 text-[#78716C]" />
          </div>
          <div>
            <span className="text-2xl font-bold text-[#1C1917] tracking-tight">
              {loading ? "..." : `${stats?.successRate ?? 100}%`}
            </span>
          </div>
        </div>

        {/* Active Queued */}
        <div className="rounded-xl border border-[#F1EDE9] bg-white p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[10px] font-bold uppercase tracking-wider">In-Flight Queue</span>
            <Zap className="h-4 w-4 text-[#78716C]" />
          </div>
          <div>
            <span className="text-2xl font-bold text-[#1C1917] tracking-tight">
              {loading ? "..." : activeQueueCount}
            </span>
          </div>
        </div>

        {/* Failed Count */}
        <div className="rounded-xl border border-[#F1EDE9] bg-white p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Dead-Letter Entries</span>
            <XCircle className="h-4 w-4 text-[#78716C]" />
          </div>
          <div>
            <span className="text-2xl font-bold text-[#1C1917] tracking-tight">
              {loading ? "..." : stats?.statusCounts.FAILED ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Channel breakdown & Live Events stream */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Channel Breakdown */}
        <div className="rounded-xl border border-[#F1EDE9] bg-white p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">Channels Distribution</h2>
            <p className="text-[11px] text-[#78716C] mt-1">Dispatches grouped by target channel</p>
          </div>

          <div className="space-y-4">
            {stats && stats.total > 0 ? (
              Object.entries(stats.channelCounts).map(([channel, count]) => {
                const percentage = Math.round((count / stats.total) * 100);
                return (
                  <div key={channel} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1C1917] text-[11px] truncate max-w-[120px]" title={channel}>
                        {channel}
                      </span>
                      <span className="font-mono text-[#78716C] text-[11px] shrink-0">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#FAF9F7]">
                      <div
                        className="h-full rounded-full bg-[#E11D48] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#78716C] py-6 text-center">No dispatch metrics recorded for this range.</p>
            )}
          </div>
        </div>

        {/* Live SSE activity logs */}
        <div className="lg:col-span-2 rounded-xl border border-[#F1EDE9] bg-white p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">Live Activity Stream</h2>
              <p className="text-[11px] text-[#78716C] mt-1">Real-time processing updates from workers</p>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-[#78716C] font-semibold">Live Feed</span>
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {liveEvents.length > 0 ? (
              liveEvents.map((evt) => (
                <div
                  key={`${evt.notificationId}-${evt.timestamp}-${evt.status}`}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-[#F1EDE9] bg-[#FAF9F7] p-3 rounded-lg text-xs gap-2"
                >
                  <div className="flex flex-col space-y-1 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-[#1C1917] text-[11px]">
                        {evt.channel}
                      </span>
                      <span className="text-[#78716C] truncate text-[11px] max-w-xs" title={evt.recipient}>
                        {evt.recipient}
                      </span>
                    </div>
                    <span className="font-mono text-[9px] text-[#78716C]">
                      ID: {evt.notificationId}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusStyle(evt.status)}`}>
                      {evt.status}
                    </span>
                    <span className="font-mono text-[10px] text-[#78716C]">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 space-y-2 border border-dashed border-[#F1EDE9] rounded-lg">
                <p className="text-xs text-[#78716C]">Awaiting incoming worker payloads...</p>
                <p className="text-[10px] text-[#78716C] text-center px-4">Send notifications via the API to trigger live streams</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
