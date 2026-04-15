import { NextRequest, NextResponse } from "next/server";
import { decrypt, verifyCodeChallenge } from "@/lib/oauth-utils";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function errorResponse(error: string, description: string, status = 400) {
  return NextResponse.json(
    { error, error_description: description },
    { status, headers: corsHeaders() },
  );
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  let params: URLSearchParams;

  if (contentType.includes("application/json")) {
    const json = await request.json();
    params = new URLSearchParams(json);
  } else {
    const body = await request.text();
    params = new URLSearchParams(body);
  }

  const grantType = params.get("grant_type");
  const code = params.get("code");
  const codeVerifier = params.get("code_verifier");
  const redirectUri = params.get("redirect_uri");

  console.log("[OAuth/token] grant_type:", grantType);

  if (grantType !== "authorization_code") {
    return errorResponse("unsupported_grant_type", "Only authorization_code is supported");
  }
  if (!code) {
    return errorResponse("invalid_request", "code is required");
  }
  if (!codeVerifier) {
    return errorResponse("invalid_request", "code_verifier is required (PKCE)");
  }

  let payload: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    code_challenge: string | null;
    code_challenge_method: string;
    redirect_uri: string;
    created_at: number;
  };

  try {
    payload = JSON.parse(decrypt(code));
  } catch {
    return errorResponse("invalid_grant", "Invalid or expired authorization code");
  }

  if (Date.now() - payload.created_at > 5 * 60 * 1000) {
    return errorResponse("invalid_grant", "Authorization code has expired");
  }

  if (!payload.code_challenge) {
    // Authorization flow was initiated without PKCE — reject to prevent bearer-token replay.
    return errorResponse("invalid_grant", "Authorization code was issued without PKCE");
  }

  const method = payload.code_challenge_method || "S256";
  if (method !== "S256") {
    return errorResponse("invalid_grant", "Unsupported code_challenge_method");
  }

  if (!verifyCodeChallenge(codeVerifier, payload.code_challenge, method)) {
    return errorResponse("invalid_grant", "PKCE verification failed");
  }

  // RFC 6749 §4.1.3: token endpoint must verify redirect_uri.
  if (!redirectUri || redirectUri !== payload.redirect_uri) {
    return errorResponse("invalid_grant", "redirect_uri mismatch");
  }

  return NextResponse.json(
    {
      access_token: payload.access_token,
      token_type: "Bearer",
      expires_in: payload.expires_in,
      refresh_token: payload.refresh_token,
    },
    { headers: corsHeaders() },
  );
}
