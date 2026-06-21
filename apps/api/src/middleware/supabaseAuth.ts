import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@notifyflow/db";
import { getSupabasePublicKey } from "../utils/supabasePublicKey.js";

/**
 * Authenticates dashboard requests using Supabase JWT tokens.
 * Replaces the old authenticateJwt middleware.
 * Expects header format: Authorization: Bearer <token>
 */
export async function authenticateJwt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or malformed authorization token" });
    }

    const token = authHeader.split(" ")[1];
    const publicKey = await getSupabasePublicKey();

    const decoded = jwt.verify(token, publicKey, { algorithms: ["ES256"] }) as { sub: string; email?: string };

    if (!decoded.sub) {
      return res.status(401).json({ error: "Invalid token payload: missing sub claim" });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { supabaseUserId: decoded.sub },
    });

    if (!tenant) {
      return res.status(401).json({ error: "Tenant not found for this Supabase user" });
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Authentication token expired" });
    }
    return res.status(401).json({ error: "Invalid authentication token" });
  }
}

/**
 * Verifies and decodes a Supabase JWT without searching for a tenant database record.
 */
export async function verifySupabaseToken(token: string): Promise<{ sub: string; email: string; name: string }> {
  const publicKey = await getSupabasePublicKey();

  const decoded = jwt.verify(token, publicKey, { algorithms: ["ES256"] }) as any;
  if (!decoded || !decoded.sub) {
    throw new Error("Invalid token payload: missing sub claim");
  }

  const email = decoded.email || "";
  const name = decoded.user_metadata?.name || decoded.user_metadata?.full_name || email.split("@")[0] || "User";

  return {
    sub: decoded.sub,
    email,
    name,
  };
}
