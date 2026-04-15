import { NextRequest, NextResponse } from "next/server";
import { resolveTrustedOrigin } from "@/lib/oauth-utils";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  const origin = resolveTrustedOrigin(request);

  return NextResponse.json(
    {
      resource: `${origin}/mcp`,
      authorization_servers: [origin],
      bearer_methods_supported: ["header"],
    },
    { headers: corsHeaders() },
  );
}
