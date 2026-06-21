"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeSnippet() {
  const [copied, setCopied] = useState(false);

  const codeText = `curl -X POST https://api.notifyflow.dev/v1/notify \\
  -H "x-api-key: nf_live_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "channel": "EMAIL",
    "recipient": "user@example.com",
    "template": "welcome",
    "data": {
      "name": "Sarah",
      "company": "Acme Corp"
    }
  }'`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="code" className="py-24 bg-white select-none font-sans text-[#1C1917]">
      <div className="max-w-6xl mx-auto px-6 grid gap-12 grid-cols-1 lg:grid-cols-2 items-center">
        {/* Left Side Info */}
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Send your first notification in minutes
          </h2>
          <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
            One HTTP call is all it takes. No SDKs to install, no complex configurations or server integrations. Connect your keys, grab your API credential, and hit the endpoint.
          </p>

          <ul className="space-y-3 font-semibold text-xs text-[#1C1917]">
            <li className="flex items-center space-x-2">
              <span className="text-[#E11D48]">✓</span>
              <span>Instant queueing via Redis/BullMQ</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-[#E11D48]">✓</span>
              <span>Automatic retries with exponential backoff</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-[#E11D48]">✓</span>
              <span>Real-time delivery state tracking</span>
            </li>
          </ul>
        </div>

        {/* Right Side Code Block (contrasting dark theme) */}
        <div className="relative rounded-xl border border-[#F1EDE9] bg-[#1C1917] p-5 shadow-lg overflow-hidden flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#78716C]/20 pb-3">
            <span className="text-[10px] font-bold font-mono text-[#78716C] uppercase tracking-wider">HTTPS POST REQUEST</span>
            <button
              onClick={handleCopy}
              className="text-[#78716C] hover:text-white p-1.5 rounded hover:bg-[#FAF9F7]/10 transition-colors"
              title="Copy snippet"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          {/* Manually colored snippet */}
          <pre className="font-mono text-[10px] sm:text-[11px] leading-relaxed text-zinc-300 overflow-x-auto whitespace-pre">
            <span className="text-zinc-500">curl</span> <span className="text-[#E11D48] font-bold">-X</span> <span className="text-[#E11D48] font-bold">POST</span> <span className="text-[#F5F0EB]">https://api.notifyflow.dev/v1/notify</span> \<br />
            &nbsp;&nbsp;<span className="text-[#E11D48] font-bold">-H</span> <span className="text-[#F5F0EB]">&quot;x-api-key: nf_live_xxxxxxxxxxxx&quot;</span> \<br />
            &nbsp;&nbsp;<span className="text-[#E11D48] font-bold">-H</span> <span className="text-[#F5F0EB]">&quot;Content-Type: application/json&quot;</span> \<br />
            &nbsp;&nbsp;<span className="text-[#E11D48] font-bold">-d</span> <span className="text-[#78716C]">&apos;{"{"}</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#FB7185]">&quot;channel&quot;</span><span className="text-[#78716C]">:</span> <span className="text-[#F5F0EB]">&quot;EMAIL&quot;</span><span className="text-[#78716C]">,</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#FB7185]">&quot;recipient&quot;</span><span className="text-[#78716C]">:</span> <span className="text-[#F5F0EB]">&quot;user@example.com&quot;</span><span className="text-[#78716C]">,</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#FB7185]">&quot;template&quot;</span><span className="text-[#78716C]">:</span> <span className="text-[#F5F0EB]">&quot;welcome&quot;</span><span className="text-[#78716C]">,</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#FB7185]">&quot;data&quot;</span><span className="text-[#78716C]">:</span> <span className="text-[#78716C]">{"{"}</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#FB7185]">&quot;name&quot;</span><span className="text-[#78716C]">:</span> <span className="text-[#F5F0EB]">&quot;Sarah&quot;</span><span className="text-[#78716C]">,</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#FB7185]">&quot;company&quot;</span><span className="text-[#78716C]">:</span> <span className="text-[#F5F0EB]">&quot;Acme Corp&quot;</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#78716C]">{"}"}</span><br />
            &nbsp;&nbsp;<span className="text-[#78716C]">{"}"}&apos;</span>
          </pre>

          <div className="border-t border-[#78716C]/20 pt-3 space-y-2">
            <span className="text-[10px] font-bold font-mono text-[#78716C] uppercase tracking-wider">RESPONSE (202 ACCEPTED)</span>
            <pre className="font-mono text-[10px] sm:text-[11px] leading-relaxed text-[#F5F0EB] overflow-x-auto whitespace-pre">
              <span className="text-[#78716C]">{"{"}</span><br />
              &nbsp;&nbsp;<span className="text-[#FB7185]">&quot;notification_id&quot;</span><span className="text-[#78716C]">:</span> <span className="text-[#F5F0EB]">&quot;notif_01HX8A...&quot;</span><span className="text-[#78716C]">,</span><br />
              &nbsp;&nbsp;<span className="text-[#FB7185]">&quot;status&quot;</span><span className="text-[#78716C]">:</span> <span className="text-[#F5F0EB]">&quot;queued&quot;</span><br />
              <span className="text-[#78716C]">{"}"}</span>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
