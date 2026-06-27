"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";

interface InAppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll in-app notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/inapp");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("[NotificationBell] Poll error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click-away
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/inapp", { method: "POST" });
      if (res.ok) {
        // Optimistically set all to read
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("[NotificationBell] Mark read error:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 hover:bg-background rounded-full transition-colors text-primary focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center border border-border"
        title="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-white rounded-full text-[9px] font-black h-4 w-4 flex items-center justify-center border border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden text-xs">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#FAF9F7] border-b border-border">
            <span className="font-bold text-primary">In-App Feed</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-accent hover:text-rose-700 font-semibold"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List items */}
          <div className="max-h-64 overflow-y-auto divide-y divide-border">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 flex flex-col space-y-1 transition-colors ${
                    n.read ? "bg-white" : "bg-[#FFF1F2]/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`font-semibold ${n.read ? "text-primary" : "text-accent"}`}>
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                    )}
                  </div>
                  <p className="text-muted leading-relaxed text-[11px]">{n.body}</p>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted font-medium">
                No notifications yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
