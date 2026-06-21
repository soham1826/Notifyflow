"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface Notification {
  id: string;
  recipient: string;
  channel: "EMAIL" | "SMS" | "WEBHOOK" | "IN_APP";
  priority: "HIGH" | "DEFAULT" | "BULK";
  status: "QUEUED" | "PROCESSING" | "RETRYING" | "DELIVERED" | "FAILED";
  rawSubject: string | null;
  rawBody: string | null;
  data: any;
  createdAt: string;
  template: { name: string } | null;
}

interface Attempt {
  id: string;
  attemptNumber: number;
  status: "DELIVERED" | "FAILED";
  error: string | null;
  attemptedAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);
        let endpoint = `/api/v1/notifications?page=${page}&limit=12`;
        if (statusFilter) endpoint += `&status=${statusFilter}`;
        if (channelFilter) endpoint += `&channel=${channelFilter}`;

        const data = await apiClient.get(endpoint);
        setNotifications(data.data);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalItems(data.pagination.total || 0);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load notifications log.");
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [page, statusFilter, channelFilter]);

  // Load attempt logs when a notification row/card is clicked
  async function handleItemClick(notification: Notification) {
    setSelectedNotification(notification);
    setAttempts([]);
    setLoadingAttempts(true);

    try {
      const data = await apiClient.get(`/api/v1/notifications/${notification.id}/attempts`);
      setAttempts(data.attempts || []);
    } catch (err) {
      console.error("Failed to load delivery attempts:", err);
    } finally {
      setLoadingAttempts(false);
    }
  }

  function getStatusBadge(status: string) {
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans relative text-[#1C1917] select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#F1EDE9] pb-5 gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1C1917] tracking-tight">
            Notifications Log
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            Browse and inspect all dispatch history ({totalItems} records)
          </p>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs self-start sm:self-auto">
          {/* Status Dropdown */}
          <div className="flex items-center space-x-1.5 border border-[#F1EDE9] rounded-lg bg-white px-2 py-1.5 min-h-[36px]">
            <span className="text-[#78716C]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-[#1C1917] outline-none pr-1 font-semibold cursor-pointer"
            >
              <option value="">All</option>
              <option value="QUEUED">QUEUED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="RETRYING">RETRYING</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          {/* Channel Dropdown */}
          <div className="flex items-center space-x-1.5 border border-[#F1EDE9] rounded-lg bg-white px-2 py-1.5 min-h-[36px]">
            <span className="text-[#78716C]">Channel:</span>
            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-[#1C1917] outline-none pr-1 font-semibold cursor-pointer"
            >
              <option value="">All</option>
              <option value="EMAIL">EMAIL</option>
              <option value="SMS">SMS</option>
              <option value="WEBHOOK">WEBHOOK</option>
              <option value="IN_APP">IN_APP</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-4 text-xs text-[#BE123C]">
          {error}
        </div>
      )}

      {/* Main Dataset Display - Table on Tablet/Desktop, Card list on Mobile */}
      <div className="rounded-xl border border-[#F1EDE9] bg-white overflow-hidden shadow-sm">
        {/* Table View: Hidden on Mobile (<768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F1EDE9] bg-[#FAF9F7] text-[#78716C] text-[10px] font-bold uppercase tracking-wider">
                <th className="p-4 pl-6">ID</th>
                {/* Hidden on Tablet (<1024px) but visible on Desktop */}
                <th className="p-4 hidden lg:table-cell">Recipient</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Template</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6">Dispatched At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EDE9] text-xs text-[#1C1917]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-[#78716C]">
                    Loading dispatches...
                  </td>
                </tr>
              ) : notifications.length > 0 ? (
                notifications.map((n) => (
                  <tr
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className="hover:bg-[#FAF9F7] cursor-pointer transition-colors"
                  >
                    <td className="p-4 pl-6 font-mono text-[10px] text-[#78716C]">
                      {n.id.substring(0, 8)}...
                    </td>
                    {/* Hidden on Tablet (<1024px) */}
                    <td className="p-4 font-semibold text-[#1C1917] truncate max-w-[200px] hidden lg:table-cell" title={n.recipient}>
                      {n.recipient}
                    </td>
                    <td className="p-4 font-mono text-[10px] text-[#78716C]">
                      {n.channel}
                    </td>
                    <td className="p-4 text-[#78716C]">
                      {n.template ? n.template.name : <span className="text-[10px] text-[#78716C] font-mono font-semibold">RAW CONTENT</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(n.status)}`}>
                        {n.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-[#78716C] font-mono text-[10px]">
                      {new Date(n.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-[#78716C]">
                    No dispatches match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card-List View: Visible only on Mobile (<768px) */}
        <div className="md:hidden divide-y divide-[#F1EDE9]">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#78716C]">
              Loading dispatches...
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className="p-4 active:bg-[#FAF9F7] cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#78716C]">
                    ID: {n.id.substring(0, 8)}
                  </span>
                  <span className="font-mono text-[10px] text-[#78716C]">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="text-sm font-semibold text-[#1C1917] truncate">
                  {n.recipient}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#FAF9F7] text-[#1C1917] border border-[#F1EDE9] px-2 py-0.5 rounded text-[10px] font-mono uppercase">
                      {n.channel}
                    </span>
                    <span className="text-[10px] text-[#78716C]">
                      {n.template ? n.template.name : "Raw"}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(n.status)}`}>
                    {n.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-xs text-[#78716C]">
              No dispatches match this filter.
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#F1EDE9] bg-[#FAF9F7] px-6 py-3.5 text-xs text-[#78716C]">
            <span>
              Page <strong className="text-[#1C1917]">{page}</strong> of <strong className="text-[#1C1917]">{totalPages}</strong>
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || loading}
                className="rounded border border-[#F1EDE9] bg-white p-1.5 hover:text-[#1C1917] active:bg-[#FAF9F7] disabled:opacity-40 min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages || loading}
                className="rounded border border-[#F1EDE9] bg-white p-1.5 hover:text-[#1C1917] active:bg-[#FAF9F7] disabled:opacity-40 min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Drawer: Responsive, full screen on mobile, right panel on desktop */}
      {selectedNotification && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] border-l border-[#F1EDE9] bg-white shadow-2xl p-6 overflow-y-auto space-y-6 z-50 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#F1EDE9] pb-4">
              <div>
                <h2 className="text-sm font-bold text-[#1C1917]">Dispatch Details</h2>
                <span className="font-mono text-[9px] text-[#78716C]">ID: {selectedNotification.id}</span>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-[#78716C] hover:text-[#1C1917] p-2 rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Core Specs */}
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#F1EDE9] bg-[#FAF9F7] p-4 text-xs">
              <div className="space-y-1">
                <span className="text-[#78716C] text-[10px] font-bold block">RECIPIENT</span>
                <span className="font-semibold text-[#1C1917] break-all">{selectedNotification.recipient}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#78716C] text-[10px] font-bold block">CHANNEL</span>
                <span className="font-semibold text-[#1C1917] font-mono">{selectedNotification.channel}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#78716C] text-[10px] font-bold block">PRIORITY</span>
                <span className="font-semibold text-[#1C1917] font-mono">{selectedNotification.priority}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#78716C] text-[10px] font-bold block">STATUS</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border ${getStatusBadge(selectedNotification.status)}`}>
                  {selectedNotification.status}
                </span>
              </div>
            </div>

            {/* Payload Metadata JSON */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#78716C]">Payload Data Variables</span>
              <pre className="rounded-lg border border-[#F1EDE9] bg-[#1C1917] p-3 font-mono text-[10px] text-zinc-300 overflow-x-auto">
                {JSON.stringify(selectedNotification.data, null, 2)}
              </pre>
            </div>

            {/* Chronological Attempt Logs */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#78716C]">Attempts Log</span>
              
              <div className="space-y-2">
                {loadingAttempts ? (
                  <p className="text-[11px] text-[#78716C] py-3">Loading attempts list...</p>
                ) : attempts.length > 0 ? (
                  attempts.map((att) => (
                    <div
                      key={att.id}
                      className="border border-[#F1EDE9] bg-[#FAF9F7] p-3 rounded-lg flex flex-col space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#1C1917] text-[11px]">
                          Attempt {att.attemptNumber}
                        </span>
                        <span className={`flex items-center gap-1 text-[9px] font-bold ${
                          att.status === "DELIVERED" ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {att.status === "DELIVERED" ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                          {att.status}
                        </span>
                      </div>
                      
                      {att.error && (
                        <p className="text-[10px] text-[#BE123C] bg-[#FFF1F2] border border-[#FB7185]/20 p-2 rounded font-mono">
                          Error: {att.error}
                        </p>
                      )}

                      <span className="text-[9px] text-[#78716C] font-mono">
                        Timestamp: {new Date(att.attemptedAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-[#78716C] border border-dashed border-[#F1EDE9] rounded p-4 text-center">
                    No attempts registered yet for this dispatch.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F1EDE9]">
            <button
              onClick={() => setSelectedNotification(null)}
              className="w-full text-center border border-[#F1EDE9] bg-[#FAF9F7] hover:bg-[#F1EDE9] text-[#1C1917] py-2.5 rounded-lg text-xs font-semibold min-h-[44px]"
            >
              Close Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
