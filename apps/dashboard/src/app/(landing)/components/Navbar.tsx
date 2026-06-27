"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Github } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Demo banner — above navbar */}
      <div 
        style={{
          background: '#FFF7ED',
          borderBottom: '1px solid #FED7AA', 
          padding: '6px 16px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#9A3412',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: '31px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ⚠️ Portfolio/demo platform — not for production use
      </div>

      <header
        className={`fixed left-0 right-0 h-16 z-50 transition-all duration-200 select-none ${
          isScrolled ? "bg-[#FAF9F7]/95 backdrop-blur-md border-b border-[#F1EDE9]" : "bg-transparent"
        }`}
        style={{ top: '31px' }}
      >
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#E11D48] text-white font-mono font-black text-sm">
              N
            </div>
            <span className="font-bold tracking-tight text-sm text-[#1C1917]">
              Notify<span className="text-[#E11D48]">flow</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-[#78716C]">
            <a href="#features" className="hover:text-[#E11D48] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#E11D48] transition-colors">How it Works</a>
            <a href="#code" className="hover:text-[#E11D48] transition-colors">Code</a>
            <a
              href={process.env.NEXT_PUBLIC_DOCS_URL || "https://notifyflow.mintlify.app"}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E11D48] transition-colors"
            >
              Docs
            </a>
            <a
              href="https://github.com/soham1826/Notifyflow"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-[#E11D48] transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors min-h-[44px] flex items-center px-2"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-[#E11D48] hover:bg-[#BE123C] px-4 py-2.5 text-xs font-semibold text-white transition-colors outline-none min-h-[44px] flex items-center justify-center"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile Hamburguer Toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden text-[#1C1917] hover:text-[#E11D48] p-2 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Toggle Menu"
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#1C1917]/25 z-40 md:hidden"
          style={{ top: '31px' }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-[#FAF9F7] border-l border-[#F1EDE9] z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-between p-6 select-none ${
          isMobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ top: '31px' }}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#F1EDE9] pb-4">
            <span className="font-bold text-sm text-[#1C1917]">
              Notify<span className="text-[#E11D48]">flow</span>
            </span>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="text-[#78716C] hover:text-[#1C1917] p-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col space-y-4 text-sm font-semibold text-[#78716C]">
            <a
              href="#features"
              onClick={() => setIsMobileOpen(false)}
              className="hover:text-[#E11D48] py-2 transition-colors border-b border-[#F1EDE9]/60"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setIsMobileOpen(false)}
              className="hover:text-[#E11D48] py-2 transition-colors border-b border-[#F1EDE9]/60"
            >
              How it Works
            </a>
            <a
              href="#code"
              onClick={() => setIsMobileOpen(false)}
              className="hover:text-[#E11D48] py-2 transition-colors border-b border-[#F1EDE9]/60"
            >
              Code
            </a>
            <a
              href={process.env.NEXT_PUBLIC_DOCS_URL || "https://notifyflow.mintlify.app"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileOpen(false)}
              className="hover:text-[#E11D48] py-2 transition-colors border-b border-[#F1EDE9]/60 block"
            >
              Docs
            </a>
            <a
              href="https://github.com/soham1826/Notifyflow"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-[#E11D48] py-2 transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </nav>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#F1EDE9]">
          <Link
            href="/auth/login"
            onClick={() => setIsMobileOpen(false)}
            className="w-full flex items-center justify-center border border-[#F1EDE9] hover:bg-[#F1EDE9] py-2.5 rounded-lg text-sm font-semibold text-[#1C1917] transition-colors min-h-[44px]"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            onClick={() => setIsMobileOpen(false)}
            className="w-full flex items-center justify-center bg-[#E11D48] hover:bg-[#BE123C] py-2.5 rounded-lg text-sm font-semibold text-white transition-colors min-h-[44px]"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </>
  );
}
