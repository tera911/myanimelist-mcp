import { NextResponse } from "next/server";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  buildAuthorizationUrl,
} from "@/lib/mal-oauth";

export async function GET() {
  const clientId = process.env.MAL_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "MAL_CLIENT_ID is not configured" },
      { status: 500 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const redirectUri = `${baseUrl}/auth/mal`;

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const authUrl = buildAuthorizationUrl({
    clientId,
    redirectUri,
    codeChallenge,
    state: codeVerifier, // Pass code_verifier via state for stateless callback
  });

  // Return the auth URL and code_verifier for the client to store
  return NextResponse.json({
    authorization_url: authUrl,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
    instructions:
      "Visit authorization_url to authenticate. After authorization, MAL will redirect to the callback URL with a code. The code_verifier is embedded in the state parameter for the callback to use.",
  });
}
