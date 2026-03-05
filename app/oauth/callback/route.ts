import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/mal-oauth";
import { decrypt, encrypt } from "@/lib/oauth-utils";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const malCode = params.get("code");
  const encryptedState = params.get("state");

  console.log("[OAuth/callback] Received callback, code length:", malCode?.length, "state length:", encryptedState?.length);

  if (!malCode || !encryptedState) {
    console.log("[OAuth/callback] ERROR: Missing code or state");
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  let statePayload: {
    redirect_uri: string;
    state: string | null;
    code_challenge: string | null;
    code_challenge_method: string;
    client_id: string | null;
    mal_code_verifier: string;
    mal_redirect_uri: string;
  };

  try {
    statePayload = JSON.parse(decrypt(encryptedState));
    console.log("[OAuth/callback] State decrypted, client redirect_uri:", statePayload.redirect_uri);
  } catch (e) {
    console.log("[OAuth/callback] ERROR: Failed to decrypt state:", e);
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const malClientId = process.env.MAL_CLIENT_ID!;
  const malClientSecret = process.env.MAL_CLIENT_SECRET;

  let malTokens;
  try {
    malTokens = await exchangeCodeForToken({
      clientId: malClientId,
      clientSecret: malClientSecret || undefined,
      code: malCode,
      codeVerifier: statePayload.mal_code_verifier,
      redirectUri: statePayload.mal_redirect_uri,
    });
    console.log("[OAuth/callback] MAL token exchange success, access_token length:", malTokens.access_token.length);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log("[OAuth/callback] ERROR: MAL token exchange failed:", message);
    return NextResponse.json(
      { error: "MAL token exchange failed", details: message },
      { status: 500 },
    );
  }

  const authCodePayload = JSON.stringify({
    access_token: malTokens.access_token,
    refresh_token: malTokens.refresh_token,
    expires_in: malTokens.expires_in,
    code_challenge: statePayload.code_challenge,
    code_challenge_method: statePayload.code_challenge_method,
    created_at: Date.now(),
  });
  const authCode = encrypt(authCodePayload);

  const redirectUrl = new URL(statePayload.redirect_uri);
  redirectUrl.searchParams.set("code", authCode);
  if (statePayload.state) {
    redirectUrl.searchParams.set("state", statePayload.state);
  }

  console.log("[OAuth/callback] Redirecting to client, auth_code length:", authCode.length, "total URL length:", redirectUrl.toString().length);
  return NextResponse.redirect(redirectUrl.toString());
}
