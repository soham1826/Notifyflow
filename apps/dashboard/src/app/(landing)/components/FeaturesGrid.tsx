"use client";

import React from "react";
import { Layers, ListOrdered, RefreshCw, Key, Shield, Activity } from "lucide-react";

export default function FeaturesGrid() {
  const features = [
    {
      icon: Layers,
      title: "Every channel, one API",
      body: "Email, webhooks, and in-app notifications from a single endpoint.",
    },
    {
      icon: ListOrdered,
      title: "Priority-aware queuing",
      body: "OTPs and alerts jump the queue. Bulk campaigns never block time-sensitive sends.",
    },
    {
      icon: RefreshCw,
      title: "Exponential backoff",
      body: "Four retry attempts with increasing delays. Permanent failures land in a reviewable dead-letter queue.",
    },
    {
      icon: Key,
      title: "Bring your own keys",
      body: "Connect your own Resend account. Your sending reputation, your deliverability.",
    },
    {
      icon: Shield,
      title: "Atomic rate limiting",
      body: "Sliding window algorithm with Redis. Precise per-tenant limits, no race conditions.",
    },
    {
      icon: Activity,
      title: "Live delivery stream",
      body: "Watch every notification move through the pipeline in real time via SSE.",
    },
  ];

  return (
    <section id="features" className="py-24 bg-[#FAF9F7] select-none font-sans text-[#1C1917]">
      <div className="max-w-6xl mx-auto px-6 space-y-16">
        {/* Headings */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need to deliver reliably
          </h2>
          <p className="text-sm text-[#78716C] max-w-lg mx-auto">
            Built for developers who care about what happens after the send.
          </p>
        </div>

        {/* 3x2 Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white rounded-xl border border-[#F1EDE9] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#FB7185]/35 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF1F2] border border-[#FB7185]/20 text-[#E11D48]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-[#1C1917]">{feat.title}</h3>
                    <p className="text-xs text-[#78716C] leading-relaxed">{feat.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
