import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
let encryptionKey: Buffer | null = null;

/**
 * Lazily retrieves and validates the encryption key from process.env.
 * Prevents ESM hoisting import order dependency issues.
 */
function getEncryptionKey(): Buffer {
  if (encryptionKey) return encryptionKey;

  const keyHex = process.env.PROVIDER_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error("[Encryption] PROVIDER_ENCRYPTION_KEY environment variable is not defined in env.");
  }

  if (keyHex.length !== 64) {
    throw new Error("[Encryption] PROVIDER_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).");
  }

  encryptionKey = Buffer.from(keyHex, "hex");
  return encryptionKey;
}

/**
 * Encrypts a plaintext API key using AES-256-GCM.
 * Returns the format "iv_hex:encrypted_hex:authtag_hex".
 */
export function encryptApiKey(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

/**
 * Decrypts a ciphertext API key using AES-256-GCM.
 */
export function decryptApiKey(ciphertext: string): string {
  const parts = ciphertext.split(":");
  if (parts.length !== 3) {
    throw new Error("[Encryption] Invalid ciphertext format. Expected iv:encrypted:tag");
  }
  
  const [ivHex, encryptedHex, authTagHex] = parts;
  
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
