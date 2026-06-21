"use client";

import React from "react";
import { Mail, Webhook, Bell, MessageSquare } from "lucide-react";

export default function ChannelShowcase() {
  return (
    <section className="py-24 bg-white select-none font-sans text-[#1C1917]">
      <div className="max-w-6xl mx-auto px-6 space-y-16">
        {/* Headings */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">Every channel covered</h2>
          <p className="text-sm text-[#78716C] max-w-md mx-auto">
            Choose the delivery method that fits your client communications strategy.
          </p>
        </div>

        {/* Channels Cards Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Email */}
          <div className="bg-white rounded-xl border border-[#F1EDE9] p-6 shadow-sm flex flex-col justify-between space-y-6 hover:border-[#FB7185]/35 transition-colors">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] border border-[#FB7185]/20 text-[#E11D48]">
                <Mail className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1C1917]">Email</h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Transactional emails via your own Resend account. Full delivery tracking.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-[#F1EDE9]">
              <span className="inline-flex items-center rounded bg-[#FFF1F2] px-2 py-0.5 text-[9px] font-bold text-[#E11D48] border border-[#FB7185]/20 font-mono">
                Via Resend
              </span>
            </div>
          </div>

          {/* Webhooks */}
          <div className="bg-white rounded-xl border border-[#F1EDE9] p-6 shadow-sm flex flex-col justify-between space-y-6 hover:border-[#FB7185]/35 transition-colors">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] border border-[#FB7185]/20 text-[#E11D48]">
                <Webhook className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1C1917]">Webhooks</h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  POST to any HTTPS endpoint with HMAC-SHA256 request signing.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-[#F1EDE9]">
              <span className="inline-flex items-center rounded bg-[#FFF1F2] px-2 py-0.5 text-[9px] font-bold text-[#E11D48] border border-[#FB7185]/20 font-mono">
                HMAC signed
              </span>
            </div>
          </div>

          {/* In-App */}
          <div className="bg-white rounded-xl border border-[#F1EDE9] p-6 shadow-sm flex flex-col justify-between space-y-6 hover:border-[#FB7185]/35 transition-colors">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F2] border border-[#FB7185]/20 text-[#E11D48]">
                <Bell className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#1C1917]">In-App</h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Persistent notifications stored in your database, retrieved via API.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-[#F1EDE9]">
              <span className="inline-flex items-center rounded bg-[#FFF1F2] px-2 py-0.5 text-[9px] font-bold text-[#E11D48] border border-[#FB7185]/20 font-mono">
                Built-in
              </span>
            </div>
          </div>

          {/* Coming Soon SMS (dimmed, no hover) */}
          <div className="bg-[#FAF9F7]/40 rounded-xl border border-[#F1EDE9] p-6 shadow-sm flex flex-col justify-between space-y-6 opacity-60 relative overflow-hidden select-none">
            {/* Ribbon/overlay banner */}
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center rounded bg-[#F1F5F9] px-2 py-0.5 text-[8px] font-bold text-[#475569] border border-[#F1F5F9] uppercase font-mono">
                Coming Soon
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1EDE9] border border-[#F1EDE9] text-[#78716C]">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#78716C]">SMS Dispatch</h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Deliver SMS text alerts worldwide via Twilio. Direct gateway pipelines.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-[#F1EDE9]">
              <span className="inline-flex items-center rounded bg-[#F1F5F9] px-2 py-0.5 text-[9px] font-bold text-[#475569] border border-[#F1F5F9] font-mono">
                SMS Provider
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
