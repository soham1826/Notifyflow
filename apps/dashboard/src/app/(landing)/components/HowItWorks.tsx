"use client";

import React from "react";
import { Key, Send, Activity } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: Key,
      title: "Bring your own keys",
      body: "Connect your Resend account in seconds. Your credentials, your sending reputation.",
    },
    {
      number: "2",
      icon: Send,
      title: "One API call",
      body: "POST to /api/v1/notify. We handle queuing, retries, and delivery across every channel.",
    },
    {
      number: "3",
      icon: Activity,
      title: "Real-time visibility",
      body: "Watch notifications flow through your pipeline live. Retry failures from the dashboard.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#FAF9F7] select-none font-sans text-[#1C1917]">
      <div className="max-w-6xl mx-auto px-6 space-y-16">
        {/* Section Heading */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="text-sm text-[#78716C] max-w-md mx-auto">
            Three simple steps to fully customized notification dispatching.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="relative grid gap-8 grid-cols-1 md:grid-cols-3">
          {/* Connector Line (Desktop only) */}
          <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-[#FB7185]/20 -z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative bg-white rounded-xl border border-[#F1EDE9] p-6 shadow-sm space-y-4 hover:border-[#FB7185]/35 transition-colors z-10"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF1F2] border border-[#FB7185]/20 text-[#E11D48]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF1F2] text-[#E11D48] text-xs font-bold font-mono">
                    {step.number}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-[#1C1917]">{step.title}</h3>
                  <p className="text-xs text-[#78716C] leading-relaxed">{step.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
