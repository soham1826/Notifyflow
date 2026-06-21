"use client";

import React from "react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-b from-[#FFF1F2]/60 to-[#FAF9F7] select-none font-sans text-[#1C1917]">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-radial-gradient from-[#FFE4E6]/40 via-transparent to-transparent opacity-60 blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto px-6 text-center space-y-8 flex flex-col items-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1F2] border border-[#FB7185]/30 px-3.5 py-1 text-xs font-bold text-[#E11D48]">
          Multi-channel notification infrastructure
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-3xl">
          Notifications that <br />
          <span className="text-[#E11D48]">actually deliver</span>
        </h1>

        {/* Subheadline */}
        <p className="text-[#78716C] text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
          One API. Every channel. Real-time delivery tracking.
          Notifyflow handles email, webhooks, and in-app notifications so you can focus on your product.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto rounded-lg bg-[#E11D48] hover:bg-[#BE123C] px-6 py-3 text-sm font-semibold text-white transition-colors outline-none min-h-[44px] flex items-center justify-center shadow-sm"
          >
            Get Started Free
          </Link>
          <a
            href={process.env.NEXT_PUBLIC_DOCS_URL || "https://notifyflow.mintlify.app"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto rounded-lg border border-[#E11D48] text-[#E11D48] hover:bg-[#FFF1F2] px-6 py-3 text-sm font-semibold transition-colors outline-none min-h-[44px] flex items-center justify-center"
          >
            View Docs
          </a>
        </div>

        {/* Social Proof */}
        <div className="text-[11px] font-bold text-[#78716C] flex items-center justify-center gap-2 pt-2">
          <span>Open source</span>
          <span className="text-[#FB7185]">•</span>
          <span>BYOK</span>
          <span className="text-[#FB7185]">•</span>
          <span>No vendor lock-in</span>
        </div>

        {/* Browser Mockup Visual (HTML/CSS only) */}
        <div className="w-full max-w-4xl mt-12 bg-white rounded-xl border border-[#F1EDE9] shadow-lg overflow-hidden animate-fade-in relative z-15">
          {/* Browser Header Bar */}
          <div className="h-10 bg-[#FAF9F7] border-b border-[#F1EDE9] flex items-center justify-between px-4">
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded-full bg-[#E11D48]/30" />
              <span className="h-3 w-3 rounded-full bg-[#FB7185]/30" />
              <span className="h-3 w-3 rounded-full bg-[#F1EDE9]" />
            </div>
            <div className="bg-white border border-[#F1EDE9] rounded px-6 py-0.5 text-[10px] text-[#78716C] font-mono select-none truncate max-w-xs sm:max-w-md">
              notifyflow.dev/dashboard/overview
            </div>
            <div className="w-12" />
          </div>

          {/* Browser Window Body: Simplified Mock Notifications list */}
          <div className="p-4 sm:p-6 overflow-x-auto text-left">
            <table className="w-full text-xs text-[#1C1917] border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-[#F1EDE9] text-[#78716C] text-[9px] uppercase tracking-wider font-bold">
                  <th className="pb-3 text-left">Notification ID</th>
                  <th className="pb-3 text-left">Recipient</th>
                  <th className="pb-3 text-left">Channel</th>
                  <th className="pb-3 text-left">Status</th>
                  <th className="pb-3 text-right">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EDE9] font-sans">
                <tr>
                  <td className="py-3 font-mono text-[10px] text-[#78716C]">notif_01HX892A</td>
                  <td className="py-3 font-semibold text-[#1C1917]">sarah@acme.com</td>
                  <td className="py-3">
                    <span className="bg-[#FFF1F2] text-[#E11D48] border border-[#FB7185]/20 px-2 py-0.5 rounded text-[10px] font-bold">EMAIL</span>
                  </td>
                  <td className="py-3">
                    <span className="bg-[#DCFCE7] text-[#15803D] border border-[#DCFCE7] px-2 py-0.5 rounded text-[10px] font-bold">DELIVERED</span>
                  </td>
                  <td className="py-3 text-right text-[#78716C] font-mono text-[10px]">12s ago</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono text-[10px] text-[#78716C]">notif_01HX8A31</td>
                  <td className="py-3 font-semibold text-[#1C1917]">https://api.copeland.io/webhook</td>
                  <td className="py-3">
                    <span className="bg-[#F1F5F9] text-[#475569] border border-[#F1F5F9] px-2 py-0.5 rounded text-[10px] font-bold">WEBHOOK</span>
                  </td>
                  <td className="py-3">
                    <span className="bg-[#FEF3C7] text-[#B45309] border border-[#FEF3C7] px-2 py-0.5 rounded text-[10px] font-bold">RETRYING</span>
                  </td>
                  <td className="py-3 text-right text-[#78716C] font-mono text-[10px]">45s ago</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono text-[10px] text-[#78716C]">notif_01HX8A89</td>
                  <td className="py-3 font-semibold text-[#1C1917]">usr_tony_stark_3000</td>
                  <td className="py-3">
                    <span className="bg-[#EFF6FF] text-[#1D4ED8] border border-[#EFF6FF] px-2 py-0.5 rounded text-[10px] font-bold">IN-APP</span>
                  </td>
                  <td className="py-3">
                    <span className="bg-[#DCFCE7] text-[#15803D] border border-[#DCFCE7] px-2 py-0.5 rounded text-[10px] font-bold">DELIVERED</span>
                  </td>
                  <td className="py-3 text-right text-[#78716C] font-mono text-[10px]">2m ago</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono text-[10px] text-[#78716C]">notif_01HX8B12</td>
                  <td className="py-3 font-semibold text-[#1C1917]">johndoe@gmail.com</td>
                  <td className="py-3">
                    <span className="bg-[#FFF1F2] text-[#E11D48] border border-[#FB7185]/20 px-2 py-0.5 rounded text-[10px] font-bold">EMAIL</span>
                  </td>
                  <td className="py-3">
                    <span className="bg-[#FFF1F2] text-[#BE123C] border border-[#FFF1F2] px-2 py-0.5 rounded text-[10px] font-bold">FAILED</span>
                  </td>
                  <td className="py-3 text-right text-[#78716C] font-mono text-[10px]">5m ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
