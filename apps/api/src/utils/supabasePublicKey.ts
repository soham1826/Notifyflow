import crypto from "crypto";

let cachedPemKey: string | null = null;

/**
 * Fetches the Supabase public key from the JWKS endpoint and caches it in memory.
 */
export async function getSupabasePublicKey(): Promise<string> {
  if (cachedPemKey) {
    return cachedPemKey;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  if (!SUPABASE_URL) {
    throw new Error("Failed to fetch Supabase JWKS — check SUPABASE_URL in .env");
  }

  try {
    const urlObj = new URL(SUPABASE_URL);
    const projectRef = urlObj.hostname.split(".")[0];
    const jwksUrl = `https://${projectRef}.supabase.co/auth/v1/.well-known/jwks.json`;

    const response = await fetch(jwksUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jwks = await response.json();
    if (!jwks || !Array.isArray(jwks.keys) || jwks.keys.length === 0) {
      throw new Error("No keys array found in JWKS response");
    }

    // Find the signing key (typically uses ES256 / P-256)
    const jwk = jwks.keys.find((key: any) => key.use === "sig" || key.alg === "ES256") || jwks.keys[0];

    // Convert JWK to PEM format using Node's crypto
    const keyObject = crypto.createPublicKey({ key: jwk, format: "jwk" });
    const pem = keyObject.export({ type: "spki", format: "pem" }) as string;

    cachedPemKey = pem;
    return pem;
  } catch (error: any) {
    console.error("[getSupabasePublicKey] Error fetching JWKS:", error);
    throw new Error("Failed to fetch Supabase JWKS — check SUPABASE_URL in .env");
  }
}
