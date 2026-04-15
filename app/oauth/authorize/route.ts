import { NextRequest, NextResponse } from "next/server";
import { generateCodeVerifier } from "@/lib/mal-oauth";
import {
  encrypt,
  isRedirectUriAllowed,
  resolveTrustedOrigin,
} from "@/lib/oauth-utils";
import { MAL_AUTH_URL } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const clientRedirectUri = params.get("redirect_uri");
  const clientState = params.get("state");
  const clientCodeChallenge = params.get("code_challenge");
  const clientCodeChallengeMethod = params.get("code_challenge_method") || "S256";
  const clientId = params.get("client_id");

  if (!clientRedirectUri) {
    return NextResponse.json({ error: "invalid_request", error_description: "redirect_uri is required" }, { status: 400 });
  }
  if (!clientId) {
    return NextResponse.json({ error: "invalid_request", error_description: "client_id is required" }, { status: 400 });
  }
  if (!clientCodeChallenge) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "code_challenge is required (PKCE)" },
      { status: 400 },
    );
  }
  if (clientCodeChallengeMethod !== "S256") {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Only S256 is supported for code_challenge_method" },
      { status: 400 },
    );
  }

  if (!isRedirectUriAllowed(clientRedirectUri)) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "redirect_uri is not allowed" },
      { status: 400 },
    );
  }

  const malClientId = process.env.MAL_CLIENT_ID;
  if (!malClientId) {
    return NextResponse.json({ error: "server_error", error_description: "MAL_CLIENT_ID not configured" }, { status: 500 });
  }

  const origin = resolveTrustedOrigin(request);
  const malRedirectUri = `${origin}/oauth/callback`;

  const malCodeVerifier = generateCodeVerifier();

  const statePayload = JSON.stringify({
    redirect_uri: clientRedirectUri,
    state: clientState,
    code_challenge: clientCodeChallenge,
    code_challenge_method: clientCodeChallengeMethod,
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

  console.log("[OAuth/authorize] redirecting to MAL");
  return NextResponse.redirect(malAuthUrl.toString());
}
