import crypto from "crypto";
import { MAL_AUTH_URL, MAL_TOKEN_URL } from "./constants";
import type { MalOAuthToken } from "./mal-types";

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
  return base64UrlEncode(crypto.randomBytes(64));
}

export function generateCodeChallenge(codeVerifier: string): string {
  // MAL uses "plain" code challenge method
  return codeVerifier;
}

export function buildAuthorizationUrl(params: {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state?: string;
}): string {
  const url = new URL(MAL_AUTH_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "plain");
  if (params.state) {
    url.searchParams.set("state", params.state);
  }
  return url.toString();
}

export async function exchangeCodeForToken(params: {
  clientId: string;
  clientSecret?: string;
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<MalOAuthToken> {
  const body = new URLSearchParams({
    client_id: params.clientId,
    grant_type: "authorization_code",
    code: params.code,
    code_verifier: params.codeVerifier,
    redirect_uri: params.redirectUri,
  });
  if (params.clientSecret) {
    body.set("client_secret", params.clientSecret);
  }

  const res = await fetch(MAL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `Token exchange failed: ${res.status} ${JSON.stringify(error)}`,
    );
  }

  return res.json() as Promise<MalOAuthToken>;
}

export async function refreshAccessToken(params: {
  clientId: string;
  clientSecret?: string;
  refreshToken: string;
}): Promise<MalOAuthToken> {
  const body = new URLSearchParams({
    client_id: params.clientId,
    grant_type: "refresh_token",
    refresh_token: params.refreshToken,
  });
  if (params.clientSecret) {
    body.set("client_secret", params.clientSecret);
  }

  const res = await fetch(MAL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `Token refresh failed: ${res.status} ${JSON.stringify(error)}`,
    );
  }

  return res.json() as Promise<MalOAuthToken>;
}
