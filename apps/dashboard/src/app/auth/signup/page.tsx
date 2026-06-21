"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Key, Mail, User, ShieldAlert } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to initialize Google login.");
      setLoading(false);
    }
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign up user on Supabase
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            full_name: name,
          },
        },
      });

      if (authError) throw authError;
      if (!data.session) {
        // In case Supabase requires email verification first (standard sign up without auto-login)
        setError("Registration successful! Please check your email for a verification link to confirm your account.");
        setLoading(false);
        return;
      }

      // 2. Call provision-tenant on the API server to create tenant record
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/provision-tenant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to provision tenant on backend database.");
      }

      // 3. Store credentials for dashboard backward compatibility
      localStorage.setItem("nf_dashboard_token", data.session.access_token);
      localStorage.setItem("nf_tenant_info", JSON.stringify(resData.tenant));

      // 4. Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please review your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF9F7] px-4 py-12 sm:px-6 lg:px-8 select-none font-sans text-[#1C1917]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-[#F1EDE9] shadow-sm">
            <span className="font-mono text-2xl font-black text-[#E11D48]">N</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-[#1C1917]">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-[#78716C]">
            Get started with multi-channel notifications in under 5 minutes
          </p>
        </div>

        {/* Card Wrapper */}
        <div className="bg-white rounded-xl border border-[#F1EDE9] p-8 shadow-sm space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-100 bg-rose-50/50 p-3 text-xs text-[#BE123C]">
              <ShieldAlert className="h-4 w-4 shrink-0 text-[#E11D48]" />
              <span>{error}</span>
            </div>
          )}

          {/* Social Google Sign in */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#F1EDE9] bg-[#FAF9F7] hover:bg-[#F1EDE9] px-4 py-2.5 text-sm font-semibold text-[#1C1917] outline-none transition-colors disabled:opacity-50 min-h-[44px]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#F1EDE9]" />
            </div>
            <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-[#78716C]">
              Or register with email
            </span>
          </div>

          {/* Email Signup Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5" htmlFor="name">
                <User className="h-3.5 w-3.5" />
                Tenant Name
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="Acme Corp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border border-[#F1EDE9] bg-white px-3 py-2.5 text-sm text-[#1C1917] placeholder-[#78716C] outline-none transition-colors focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5" htmlFor="email">
                <Mail className="h-3.5 w-3.5" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="developer@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-[#F1EDE9] bg-white px-3 py-2.5 text-sm text-[#1C1917] placeholder-[#78716C] outline-none transition-colors focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5" htmlFor="password">
                <Key className="h-3.5 w-3.5" />
                Choose Password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-[#F1EDE9] bg-white px-3 py-2.5 text-sm text-[#1C1917] placeholder-[#78716C] outline-none transition-colors focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] min-h-[44px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center rounded-lg bg-[#E11D48] hover:bg-[#BE123C] py-2.5 text-sm font-semibold text-white transition-colors outline-none disabled:opacity-50 min-h-[44px]"
            >
              {loading ? "Creating Account..." : "Create Account & Provision API"}
            </button>
          </form>
        </div>

        {/* Footer Navigation */}
        <div className="text-center text-sm text-[#78716C]">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[#E11D48] hover:underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
