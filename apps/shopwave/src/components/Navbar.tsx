import React from "react";
import Link from "next/link";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  return (
    <header className="sticky top-0 bg-white border-b border-border z-30 select-none">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left Branding */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-lg font-bold tracking-tight text-primary">
            Shopwave
          </span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center space-x-6 text-xs">
          {/* Notifyflow Brand Badge */}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#FFF1F2] border border-[#FB7185]/30 hover:border-accent text-accent transition-colors font-semibold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>Powered by Notifyflow</span>
          </a>

          {/* User Profile Info */}
          <span className="text-muted font-medium hidden sm:inline-block">
            demo@shopwave.com
          </span>

          {/* Notification Bell */}
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
