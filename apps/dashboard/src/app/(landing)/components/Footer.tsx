"use client";

import React from "react";
import Link from "next/link";
import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#F1EDE9] select-none font-sans text-xs text-[#78716C]">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Main 4-column Grid */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {/* Col 1 */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#E11D48] text-white font-mono font-black text-[11px]">
                N
              </div>
              <span className="font-bold tracking-tight text-xs text-[#1C1917]">
                Notifyflow
              </span>
            </Link>
            <p className="leading-relaxed max-w-[200px]">
              Multi-channel notification infrastructure for developers.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#1C1917] uppercase tracking-wider text-[10px]">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/auth/login" className="hover:text-[#E11D48] transition-colors">Dashboard</Link></li>
              <li><a href={process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3001"} target="_blank" rel="noopener noreferrer" className="hover:text-[#E11D48] transition-colors">Docs</a></li>
              <li><span className="hover:text-[#E11D48] transition-colors cursor-pointer">Changelog</span></li>
              <li><a href="https://github.com/yourusername/notifyflow" target="_blank" rel="noreferrer" className="hover:text-[#E11D48] transition-colors">GitHub</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#1C1917] uppercase tracking-wider text-[10px]">Channels</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-[#E11D48] transition-colors">Email</a></li>
              <li><a href="#features" className="hover:text-[#E11D48] transition-colors">Webhooks</a></li>
              <li><a href="#features" className="hover:text-[#E11D48] transition-colors">In-App</a></li>
              <li><span className="text-[#78716C]/50 cursor-default">SMS (Coming Soon)</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#1C1917] uppercase tracking-wider text-[10px]">Developer</h4>
            <ul className="space-y-2">
              <li><a href={`${process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3001"}/api-reference/authentication`} target="_blank" rel="noopener noreferrer" className="hover:text-[#E11D48] transition-colors">API Reference</a></li>
              <li><a href={`${process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3001"}/quickstart`} target="_blank" rel="noopener noreferrer" className="hover:text-[#E11D48] transition-colors">Quickstart</a></li>
              <li><a href={`${process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3001"}/concepts`} target="_blank" rel="noopener noreferrer" className="hover:text-[#E11D48] transition-colors">Concepts</a></li>
              <li><span className="hover:text-[#E11D48] transition-colors cursor-pointer">Status</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-[#F1EDE9] gap-4">
          <span>
            &copy; 2026 Notifyflow. Open source and free to use.
          </span>
          <a
            href="https://github.com/yourusername/notifyflow"
            target="_blank"
            rel="noreferrer"
            className="text-[#78716C] hover:text-[#1C1917] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center sm:justify-end"
            title="GitHub Repository"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
