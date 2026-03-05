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

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  console.log("[OAuth/token] Content-Type:", contentType);

  let params: URLSearchParams;

  // Support both form-urlencoded and JSON body
  if (contentType.includes("application/json")) {
    const json = await request.json();
    console.log("[OAuth/token] JSON body keys:", Object.keys(json));
    params = new URLSearchParams(json);
  } else {
    const body = await request.text();
    params = new URLSearchParams(body);
    console.log("[OAuth/token] Form body keys:", Array.from(params.keys()));
  }

  const grantType = params.get("grant_type");
  const code = params.get("code");
  const codeVerifier = params.get("code_verifier");
  const clientId = params.get("client_id");
  const redirectUri = params.get("redirect_uri");

  console.log("[OAuth/token] grant_type:", grantType, "code length:", code?.length, "code_verifier:", codeVerifier ? "present" : "absent", "client_id:", clientId, "redirect_uri:", redirectUri);

  if (grantType !== "authorization_code") {
    console.log("[OAuth/token] ERROR: unsupported grant_type:", grantType);
    return NextResponse.json(
      { error: "unsupported_grant_type" },
      { status: 400, headers: corsHeaders() },
    );
  }

  if (!code) {
    console.log("[OAuth/token] ERROR: missing code");
    return NextResponse.json(
      { error: "invalid_request", error_description: "code is required" },
      { status: 400, headers: corsHeaders() },
    );
  }

  let payload: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    code_challenge: string | null;
    code_challenge_method: string;
    created_at: number;
  };

  try {
    payload = JSON.parse(decrypt(code));
    console.log("[OAuth/token] Code decrypted successfully");
  } catch (e) {
    console.log("[OAuth/token] ERROR: Failed to decrypt code:", e);
    return NextResponse.json(
      { error: "invalid_grant", error_description: "Invalid or expired authorization code" },
      { status: 400, headers: corsHeaders() },
    );
  }

  if (Date.now() - payload.created_at > 5 * 60 * 1000) {
    console.log("[OAuth/token] ERROR: Code expired");
    return NextResponse.json(
      { error: "invalid_grant", error_description: "Authorization code has expired" },
      { status: 400, headers: corsHeaders() },
    );
  }

  if (payload.code_challenge && codeVerifier) {
    const valid = verifyCodeChallenge(
      codeVerifier,
      payload.code_challenge,
      payload.code_challenge_method || "S256",
    );
    if (!valid) {
      console.log("[OAuth/token] ERROR: PKCE verification failed");
      return NextResponse.json(
        { error: "invalid_grant", error_description: "PKCE verification failed" },
        { status: 400, headers: corsHeaders() },
      );
    }
    console.log("[OAuth/token] PKCE verified OK");
  }

  console.log("[OAuth/token] SUCCESS: Returning tokens");
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
