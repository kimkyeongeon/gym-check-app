import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin";
import { getOAuthClient, DRIVE_OAUTH_SCOPE } from "@/lib/drive";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const redirectUri = `${req.nextUrl.origin}/api/admin/drive-auth/callback`;
  const client = getOAuthClient(redirectUri);
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [DRIVE_OAUTH_SCOPE],
  });

  return NextResponse.redirect(url);
}
