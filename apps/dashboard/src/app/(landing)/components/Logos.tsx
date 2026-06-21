"use client";

import React from "react";

export default function Logos() {
  return (
    <section className="py-12 border-y border-[#F1EDE9] bg-white select-none font-sans text-center">
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
          Built with tools you already know
        </span>
        
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-[#78716C]">
          {/* PostgreSQL SVG */}
          <div className="flex items-center space-x-1.5 hover:text-[#E11D48] transition-colors cursor-default">
            <span className="font-semibold text-sm tracking-tight">PostgreSQL</span>
          </div>

          {/* Redis SVG */}
          <div className="flex items-center space-x-1.5 hover:text-[#E11D48] transition-colors cursor-default">
            <span className="font-semibold text-sm tracking-tight">Redis</span>
          </div>

          {/* BullMQ */}
          <div className="flex items-center space-x-1.5 hover:text-[#E11D48] transition-colors cursor-default">
            <span className="font-semibold text-sm tracking-tight">BullMQ</span>
          </div>

          {/* Resend */}
          <div className="flex items-center space-x-1.5 hover:text-[#E11D48] transition-colors cursor-default">
            <span className="font-semibold text-sm tracking-tight">Resend</span>
          </div>

          {/* Next.js */}
          <div className="flex items-center space-x-1.5 hover:text-[#E11D48] transition-colors cursor-default">
            <span className="font-semibold text-sm tracking-tight">Next.js</span>
          </div>
        </div>
      </div>
    </section>
  );
}
