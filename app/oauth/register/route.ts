import { NextRequest, NextResponse } from "next/server";
import { generateRandomString } from "@/lib/oauth-utils";

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

// Dynamic client registration (RFC 7591)
// Accept any registration — we don't track clients for this prototype.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  const clientId = generateRandomString(16);

  return NextResponse.json(
    {
      client_id: clientId,
      client_name: body.client_name || "MCP Client",
      redirect_uris: body.redirect_uris || [],
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    },
    { status: 201, headers: corsHeaders() },
  );
}
