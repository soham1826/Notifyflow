import bcrypt from "bcrypt";
import crypto from "crypto";

/**
 * Hashes a plain text password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain text password with a bcrypt hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generates a secure, cryptographically random API key.
 * Prefixed with 'nf_' (Notifyflow) for clear developer identification.
 */
export function generateApiKey(): string {
  // 32 bytes = 256 bits of entropy, formatted as a hex string
  const token = crypto.randomBytes(32).toString("hex");
  return `nf_${token}`;
}
