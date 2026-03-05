import { NextRequest, NextResponse } from "next/server";
import { generateCodeVerifier } from "@/lib/mal-oauth";
import { encrypt } from "@/lib/oauth-utils";
import { MAL_AUTH_URL } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  console.log("[OAuth/authorize] Params:", Object.fromEntries(params.entries()));

  const clientRedirectUri = params.get("redirect_uri");
  const clientState = params.get("state");
  const clientCodeChallenge = params.get("code_challenge");
  const clientCodeChallengeMethod = params.get("code_challenge_method") || "S256";
  const clientId = params.get("client_id");

  if (!clientRedirectUri) {
    console.log("[OAuth/authorize] ERROR: missing redirect_uri");
    return NextResponse.json({ error: "redirect_uri is required" }, { status: 400 });
  }

  const malClientId = process.env.MAL_CLIENT_ID;
  if (!malClientId) {
    return NextResponse.json({ error: "MAL_CLIENT_ID not configured" }, { status: 500 });
  }

  const proto = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const origin = `${proto}://${host}`;
  const malRedirectUri = `${origin}/oauth/callback`;

  const malCodeVerifier = generateCodeVerifier();

  const statePayload = JSON.stringify({
    redirect_uri: clientRedirectUri,
    state: clientState,
    code_challenge: clientCodeChallenge,
    code_challenge_method: clientCodeChallengeMethod,
    client_id: clientId,
    mal_code_verifier: malCodeVerifier,
    mal_redirect_uri: malRedirectUri,
  });
  const encryptedState = encrypt(statePayload);

  const malAuthUrl = new URL(MAL_AUTH_URL);
  malAuthUrl.searchParams.set("response_type", "code");
  malAuthUrl.searchParams.set("client_id", malClientId);
  malAuthUrl.searchParams.set("redirect_uri", malRedirectUri);
  malAuthUrl.searchParams.set("code_challenge", malCodeVerifier);
  malAuthUrl.searchParams.set("code_challenge_method", "plain");
  malAuthUrl.searchParams.set("state", encryptedState);

  console.log("[OAuth/authorize] Redirecting to MAL, client_redirect_uri:", clientRedirectUri);
  return NextResponse.redirect(malAuthUrl.toString());
}
