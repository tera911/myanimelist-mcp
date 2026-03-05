import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function deriveKey(secret: string): Buffer {
  return crypto.scryptSync(secret, "myanimelist-mcp-salt", 32);
}

function getSecret(): string {
  const secret = process.env.MAL_CLIENT_SECRET || process.env.MAL_CLIENT_ID;
  if (!secret) throw new Error("MAL_CLIENT_SECRET or MAL_CLIENT_ID is required");
  return secret;
}

export function encrypt(plaintext: string): string {
  const key = deriveKey(getSecret());
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  // iv (12) + tag (16) + encrypted
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decrypt(ciphertext: string): string {
  const key = deriveKey(getSecret());
  const buf = Buffer.from(ciphertext, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final("utf8");
}

export function verifyCodeChallenge(
  codeVerifier: string,
  codeChallenge: string,
  method: string,
): boolean {
  if (method === "S256") {
    const hash = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");
    return hash === codeChallenge;
  }
  // plain
  return codeVerifier === codeChallenge;
}

export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString("base64url");
}
