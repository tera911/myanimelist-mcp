import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/lib/oauth-utils";

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

// Reject schemes that an attacker could point at an internal service
// or use to exfiltrate the authorization code outside of a browser.
function isAcceptableRedirectUri(uri: string): boolean {
  try {
    const url = new URL(uri);
    if (url.protocol === "https:") return true;
    if (url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Dynamic client registration (RFC 7591).
// Stateless: redirect_uris are encoded into client_id via authenticated
// encryption so /oauth/authorize can validate them without a database.
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
  if (redirectUris.length !== rawRedirectUris.length || !redirectUris.every(isAcceptableRedirectUri)) {
    return NextResponse.json(
      { error: "invalid_redirect_uri", error_description: "One or more redirect_uris are not acceptable" },
      { status: 400, headers: corsHeaders() },
    );
  }

  const clientId = encrypt(
    JSON.stringify({
      redirect_uris: redirectUris,
      client_name: typeof body.client_name === "string" ? body.client_name : "MCP Client",
      created_at: Date.now(),
    }),
  );

  return NextResponse.json(
    {
      client_id: clientId,
      client_name: body.client_name || "MCP Client",
      redirect_uris: redirectUris,
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    },
    { status: 201, headers: corsHeaders() },
  );
}
