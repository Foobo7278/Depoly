import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customClientId = searchParams.get("clientId");
    const customClientSecret = searchParams.get("clientSecret");

    const clientId = customClientId || process.env.GOOGLE_CLIENT_ID;
    
    // Determine redirect URI
    // Use NEXT_PUBLIC_APP_URL, APP_URL, or fall back to request header host
    const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || req.nextUrl.origin;
    const redirectUri = `${origin}/api/auth/google/callback`;

    if (!clientId) {
      return NextResponse.json({
        success: true,
        configured: false,
        url: null,
        message: "Google OAuth credentials are not fully configured in your environment variables. Using high-fidelity Google sandbox auth simulator mode."
      });
    }

    // Google OAuth 2.0 authorization endpoint
    let statePayload = "flux_meet_oauth_state";
    if (customClientId || customClientSecret) {
      statePayload = Buffer.from(JSON.stringify({
        c_id: customClientId || "",
        c_secret: customClientSecret || "",
        ts: Date.now()
      })).toString("base64url");
    }

    const urlParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      access_type: "offline",
      prompt: "consent",
      state: statePayload
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${urlParams.toString()}`;

    return NextResponse.json({
      success: true,
      configured: true,
      url: googleAuthUrl
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to generate Google OAuth URL"
    }, { status: 500 });
  }
}
