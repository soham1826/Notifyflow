import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@notifyflow/db";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_change_me_in_prod";

/**
 * Authenticates dashboard requests using JWT tokens.
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
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };

    const tenant = await prisma.tenant.findUnique({
      where: { id: decoded.id },
    });

    if (!tenant) {
      return res.status(401).json({ error: "Tenant not found or has been deleted" });
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
 * Authenticates public API requests using API Keys.
 * Expects header format: x-api-key: nf_...
 */
export async function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || typeof apiKey !== "string") {
      return res.status(401).json({ error: "Missing or malformed x-api-key header" });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { apiKey: apiKey },
    });

    if (!tenant) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    console.error("API Key authentication error:", error);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
}
