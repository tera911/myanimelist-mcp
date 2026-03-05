import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/mal-oauth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // code_verifier passed via state

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 },
    );
  }

  if (!state) {
    return NextResponse.json(
      { error: "Missing state (code_verifier)" },
      { status: 400 },
    );
  }

  const clientId = process.env.MAL_CLIENT_ID;
  const clientSecret = process.env.MAL_CLIENT_SECRET;

  if (!clientId) {
    return NextResponse.json(
      { error: "MAL_CLIENT_ID is not configured" },
      { status: 500 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const redirectUri = `${baseUrl}/auth/mal`;

  try {
    const token = await exchangeCodeForToken({
      clientId,
      clientSecret: clientSecret || undefined,
      code,
      codeVerifier: state,
      redirectUri,
    });

    // Return token as HTML page with instructions
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>MyAnimeList Authentication Success</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #1a1a2e; color: #e0e0e0; }
    .success { background: #16213e; border: 1px solid #0f3460; border-radius: 8px; padding: 24px; }
    h1 { color: #2e86de; }
    .token { background: #0a0a1a; padding: 16px; border-radius: 4px; font-family: monospace; word-break: break-all; font-size: 14px; margin: 12px 0; }
    .warning { color: #e94560; font-size: 14px; margin-top: 16px; }
    .label { color: #a0a0a0; font-size: 12px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="success">
    <h1>Authentication Successful</h1>
    <p>Your MyAnimeList account has been authorized. Use the access token below with MCP tools that require authentication.</p>
    <div class="label">Access Token</div>
    <div class="token">${token.access_token}</div>
    <div class="label">Refresh Token</div>
    <div class="token">${token.refresh_token}</div>
    <div class="label">Expires In</div>
    <div class="token">${token.expires_in} seconds</div>
    <p class="warning">Keep these tokens secure. Do not share them publicly.</p>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Token exchange failed", details: message },
      { status: 500 },
    );
  }
}
