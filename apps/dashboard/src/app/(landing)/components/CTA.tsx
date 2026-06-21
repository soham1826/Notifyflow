"use client";

import React from "react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#FAF9F7] to-[#FFF1F2]/50 select-none font-sans text-center text-[#1C1917]">
      <div className="max-w-6xl mx-auto px-6 space-y-6 flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Start sending in minutes
        </h2>
        <p className="text-sm text-[#78716C] max-w-sm mx-auto">
          Free to use. Bring your own provider keys. No credit card required.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-4">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto rounded-lg bg-[#E11D48] hover:bg-[#BE123C] px-6 py-3 text-sm font-semibold text-white transition-colors outline-none min-h-[44px] flex items-center justify-center shadow-sm"
          >
            Get Started Free
          </Link>
          <a
            href={process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3001"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto rounded-lg border border-[#F1EDE9] bg-white hover:bg-[#FAF9F7] text-[#1C1917] px-6 py-3 text-sm font-semibold transition-colors outline-none min-h-[44px] flex items-center justify-center shadow-sm"
          >
            Read the Docs
          </a>
        </div>
      </div>
    </section>
  );
}
