"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Activity,
  FileText,
  AlertTriangle,
  Key,
  LogOut,
  Sliders,
  User,
  Globe,
  BookOpen,
  Menu,
  X,
} from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  email: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    async function syncAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        localStorage.removeItem("nf_dashboard_token");
        localStorage.removeItem("nf_tenant_info");
        router.push("/auth/login");
        return;
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const token = session.access_token;
      localStorage.setItem("nf_dashboard_token", token);

      const tenantInfo = localStorage.getItem("nf_tenant_info");
      if (!tenantInfo) {
        try {
          const response = await fetch(`${apiBaseUrl}/api/v1/auth/provision-tenant`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const resData = await response.json();
            localStorage.setItem("nf_tenant_info", JSON.stringify(resData.tenant));
            setTenant(resData.tenant);
          } else {
            throw new Error("Failed to fetch tenant details");
          }
        } catch (err) {
          console.error("Auth sync error:", err);
          router.push("/auth/login");
        }
      } else {
        try {
          setTenant(JSON.parse(tenantInfo));
        } catch {
          localStorage.removeItem("nf_tenant_info");
        }
      }
    }

    syncAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        localStorage.removeItem("nf_dashboard_token");
        localStorage.removeItem("nf_tenant_info");
        router.push("/auth/login");
      } else if (session) {
        localStorage.setItem("nf_dashboard_token", session.access_token);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("nf_dashboard_token");
    localStorage.removeItem("nf_tenant_info");
    router.push("/auth/login");
  }

  // Prevent flash of unauthenticated content during client-side boot
  if (!mounted) {
    return <div className="min-h-screen bg-[#FAF9F7] text-[#1C1917]" />;
  }

  const menuItems = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: Activity,
    },
    {
      name: "Notifications",
      href: "/dashboard/notifications",
      icon: FileText,
    },
    {
      name: "Dead-Letter Queue",
      href: "/dashboard/dead-letter",
      icon: AlertTriangle,
    },
    {
      name: "Templates",
      href: "/dashboard/templates",
      icon: Sliders,
    },
    {
      name: "Providers",
      href: "/dashboard/providers",
      icon: Globe,
    },
    {
      name: "Developer Docs",
      href: process.env.NEXT_PUBLIC_DOCS_URL || "https://notifyflow.mintlify.app",
      icon: BookOpen,
      external: true,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Key,
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white">
      <div className="flex flex-col">
        {/* Logo & Header */}
        <div className="flex h-16 items-center space-x-2.5 px-6 border-b border-[#F1EDE9]">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#E11D48] text-white font-mono font-black text-sm">
            N
          </div>
          <span className="font-bold tracking-tight text-sm text-[#1C1917]">
            Notify<span className="text-[#E11D48]">flow</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 px-4 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors min-h-[40px] ${
                  isActive
                    ? "bg-[#FFF1F2] text-[#E11D48] border border-[#FB7185]/20"
                    : "text-[#78716C] hover:bg-[#FAF9F7] hover:text-[#1C1917] border border-transparent"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tenant Footer Profile */}
      <div className="p-4 border-t border-[#F1EDE9]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF9F7] border border-[#F1EDE9]">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-[#F1EDE9] text-[#78716C]">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-[#1C1917] truncate">
                {tenant ? tenant.name : "Developer"}
              </span>
              <span className="text-[10px] text-[#78716C] truncate">
                {tenant ? tenant.email : ""}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#78716C] hover:text-[#E11D48] p-1.5 rounded transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className="flex min-h-screen bg-[#FAF9F7] font-sans text-[#1C1917]"
      style={{ paddingTop: "38px" }}
    >
      {/* Demo disclaimer banner */}
      <div 
        style={{ 
          background: "#FFF7ED",
          borderBottom: "1px solid #FED7AA",
          height: "38px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontSize: "13px",
          color: "#9A3412",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100
        }}
      >
        <span>⚠️</span>
        <span>
          This is a portfolio/demo platform. Do not use for production workloads. 
          Abuse will result in account termination.
        </span>
      </div>

      {/* Sidebar for Desktop (1024px+) */}
      <aside 
        className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:shrink-0 border-r border-[#F1EDE9] bg-white z-20"
        style={{ top: "38px" }}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar Drawer for Mobile/Tablet (<1024px) */}
      <div className="lg:hidden">
        {/* Semi-transparent warm overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-[#1C1917]/30 z-40 transition-opacity duration-300"
            style={{ top: "38px" }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Drawer container */}
        <aside
          className={`fixed inset-y-0 left-0 w-60 border-r border-[#F1EDE9] bg-white z-50 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ top: "38px" }}
        >
          {/* Close button inside drawer */}
          <div className="absolute top-4 right-4 z-50 lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-[#78716C] hover:text-[#1C1917] p-1.5 rounded transition-colors"
              title="Close Menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {sidebarContent}
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        {/* Mobile Header Bar */}
        <header 
          className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#F1EDE9] flex items-center justify-between px-4 z-30"
          style={{ top: "38px" }}
        >
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-[#E11D48] hover:text-[#BE123C] p-2 rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Open Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#E11D48] text-white font-mono font-black text-xs">
              N
            </div>
            <span className="font-bold tracking-tight text-xs text-[#1C1917]">
              Notify<span className="text-[#E11D48]">flow</span>
            </span>
          </div>
          <div className="w-10" /> {/* Spacer to center the logo */}
        </header>

        {/* Content wrapper with responsive padding */}
        <main className="flex-1 overflow-y-auto mt-16 lg:mt-0 p-4 md:p-6 lg:p-8">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
