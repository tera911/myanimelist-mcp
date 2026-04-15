import { NextRequest, NextResponse } from "next/server";
import { generateRandomString, isRedirectUriAllowed } from "@/lib/oauth-utils";

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

// Dynamic client registration (RFC 7591).
// The client_id is opaque — the security boundary is the static redirect_uri
// allowlist in lib/oauth-utils.ts, not per-client state.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const rawRedirectUris: unknown = body.redirect_uris;

  if (!Array.isArray(rawRedirectUris) || rawRedirectUris.length === 0) {
    return NextResponse.json(
      { error: "invalid_redirect_uri", error_description: "redirect_uris is required" },
      { status: 400, headers: corsHeaders() },
    );
  }

  const redirectUris = rawRedirectUris.filter((u): u is string => typeof u === "string");
  if (redirectUris.length !== rawRedirectUris.length || !redirectUris.every(isRedirectUriAllowed)) {
    return NextResponse.json(
      {
        error: "invalid_redirect_uri",
        error_description:
          "Only loopback (localhost/127.0.0.1) and https://claude.ai / https://claude.com redirect URIs are allowed",
      },
      { status: 400, headers: corsHeaders() },
    );
  }

  const clientId = generateRandomString(16);

  return NextResponse.json(
    {
      client_id: clientId,
      client_name: typeof body.client_name === "string" ? body.client_name : "MCP Client",
      redirect_uris: redirectUris,
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    },
    { status: 201, headers: corsHeaders() },
  );
}
