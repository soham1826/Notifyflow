"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";

export interface FeedEvent {
  id: string; // notificationId
  channel: 'EMAIL' | 'WEBHOOK' | 'IN_APP' | 'SMS';
  status: 'QUEUED' | 'PROCESSING' | 'DELIVERED' | 'FAILED';
  description: string;
  timestamp: Date;
  error?: string | null;
}

export interface NotifyflowFeedRef {
  addEvents: (newEvents: Omit<FeedEvent, "timestamp">[]) => void;
}

const NotifyflowFeed = forwardRef<NotifyflowFeedRef, {}>((props, ref) => {
  const [events, setEvents] = useState<FeedEvent[]>([]);

  // Expose addEvents to the parent component
  useImperativeHandle(ref, () => ({
    addEvents(newEvents) {
      const eventsWithTime = newEvents.map((e) => ({
        ...e,
        timestamp: new Date(),
      }));
      setEvents((prev) => [...eventsWithTime, ...prev]);
    },
  }));

  // Poll status of active notifications (QUEUED/PROCESSING)
  useEffect(() => {
    const activeIds = events
      .filter((e) => e.status === "QUEUED" || e.status === "PROCESSING")
      .map((e) => e.id);

    if (activeIds.length === 0) return;

    const interval = setInterval(() => {
      activeIds.forEach(async (id) => {
        try {
          const res = await fetch(`/api/notification-status/${id}`);
          if (res.ok) {
            const data = await res.json();
            const dbStatus = data.notification?.status; // e.g. QUEUED, PROCESSING, DELIVERED, FAILED, RETRYING
            
            // Map RETRYING to PROCESSING for visual simplicity in the feed
            let feedStatus: FeedEvent["status"] = "QUEUED";
            if (dbStatus === "PROCESSING" || dbStatus === "RETRYING") feedStatus = "PROCESSING";
            else if (dbStatus === "DELIVERED") feedStatus = "DELIVERED";
            else if (dbStatus === "FAILED") feedStatus = "FAILED";
            else if (dbStatus === "QUEUED") feedStatus = "QUEUED";

            const errorMsg = data.notification?.attempts?.[0]?.error || null;

            if (dbStatus) {
              setEvents((prev) =>
                prev.map((e) =>
                  e.id === id ? { ...e, status: feedStatus, error: errorMsg } : e
                )
              );
            }
          }
        } catch (err) {
          console.error(`[NotifyflowFeed] Status poll error for ${id}:`, err);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [events]);

  const getChannelBadgeClass = (channel: FeedEvent["channel"]) => {
    switch (channel) {
      case "EMAIL":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "WEBHOOK":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "IN_APP":
        return "bg-green-50 text-green-700 border-green-200";
      case "SMS":
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getStatusBadgeClass = (status: FeedEvent["status"]) => {
    switch (status) {
      case "QUEUED":
        return "bg-gray-100 text-gray-700";
      case "PROCESSING":
        return "bg-blue-100 text-blue-700 animate-pulse";
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-700";
      case "FAILED":
        return "bg-rose-100 text-rose-700";
    }
  };

  // Helper for relative timestamps
  const getRelativeTime = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    return `${seconds}s ago`;
  };

  // Force re-render timestamps every second
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white border border-border rounded-xl p-5 flex flex-col space-y-4 shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-primary flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Notifyflow Live Feed
          </h2>
          <p className="text-[11px] text-muted leading-tight">
            Watch notifications flow in real time
          </p>
        </div>
      </div>

      {/* Feed content */}
      <div className="flex-1 overflow-y-auto max-h-[480px] min-h-[300px] space-y-3 pr-1 scrollbar-thin">
        {events.length > 0 ? (
          events.map((e) => (
            <div
              key={e.id}
              className="p-3 border border-border rounded-lg bg-[#FAF9F7]/30 space-y-2.5 animate-fade-in text-[11px] flex flex-col justify-between"
            >
              {/* Badge line */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getChannelBadgeClass(e.channel)}`}>
                    {e.channel === "IN_APP" ? "IN-APP" : e.channel}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getStatusBadgeClass(e.status)}`}>
                    {e.status}
                  </span>
                </div>
                <span className="text-[10px] text-muted">{getRelativeTime(e.timestamp)}</span>
              </div>

              {/* Description */}
              <p className="text-primary font-medium">{e.description}</p>

              {/* Notification ID and Errors */}
              <div className="flex flex-col gap-1.5 border-t border-border/40 pt-2 text-[10px]">
                <div className="font-mono text-gray-400 truncate">
                  ID: <span className="select-all">{e.id}</span>
                </div>
                {e.error && (
                  <div className="text-rose-600 font-medium">
                    ⚠️ Error: {e.error}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-center p-8 text-muted font-medium text-xs">
            Place an order to see notifications <br /> appear here in real time →
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border pt-3 flex flex-col items-center justify-center space-y-1 text-[10px] text-muted">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent font-semibold flex items-center gap-1 transition-colors"
        >
          <span>Powered by Notifyflow</span>
          <span>↗</span>
        </a>
        <span>View full delivery logs on Notifyflow dashboard</span>
      </div>
    </div>
  );
});

NotifyflowFeed.displayName = "NotifyflowFeed";

export default NotifyflowFeed;
