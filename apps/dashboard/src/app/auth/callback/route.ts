import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.session) {
      // Call Express backend to ensure the tenant record is provisioned
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      try {
        await fetch(`${apiBaseUrl}/api/v1/auth/provision-tenant`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.session.access_token}`,
          },
        });
      } catch (err) {
        console.error("Failed to provision tenant during OAuth callback:", err);
      }
      
      // Redirect to next path (typically /dashboard)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=OAuth code exchange failed`);
}
