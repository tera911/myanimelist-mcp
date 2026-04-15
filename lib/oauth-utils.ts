import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function deriveKey(secret: string): Buffer {
  return crypto.scryptSync(secret, "myanimelist-mcp-salt", 32);
}

function getSecret(): string {
  const secret = process.env.MAL_CLIENT_SECRET;
  if (!secret) {
    throw new Error(
      "MAL_CLIENT_SECRET is required for encryption key derivation. " +
        "MAL_CLIENT_ID must NOT be used as a fallback because it is public.",
    );
  }
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

// Resolve a trustworthy origin. Prefer explicit env config over
// proxy headers, which are forgeable when a request bypasses the
// upstream (e.g. direct hit to the origin server).
export function resolveTrustedOrigin(request: Request): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const headers = request.headers;
  const host = headers.get("host") || "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

// Static allowlist. Dynamic client registration still issues client_ids,
// but the redirect_uri must match one of these rules. This keeps the
// attack surface tiny and avoids trusting anything attacker-controlled.
//
//   - localhost / 127.0.0.1 on any port, any path, http or https
//     (loopback is inherently safe per RFC 8252 §7.3: attacker cannot
//     bind to the victim's localhost)
//   - claude.ai / claude.com on https, any path
//     (Anthropic-controlled domains)
export function isRedirectUriAllowed(candidate: string): boolean {
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return false;
  }

  if (url.protocol === "http:" || url.protocol === "https:") {
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      return true;
    }
  }

  if (url.protocol === "https:") {
    if (url.hostname === "claude.ai" || url.hostname === "claude.com") {
      return true;
    }
  }

  return false;
}
