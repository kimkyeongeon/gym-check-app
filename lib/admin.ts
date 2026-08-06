import type { NextRequest } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";

function expectedToken(): string {
  const passcode = process.env.ADMIN_PASSCODE ?? "";
  return crypto.createHash("sha256").update(`gymcheck-admin:${passcode}`).digest("hex");
}

export function verifyPasscode(input: string): boolean {
  return !!process.env.ADMIN_PASSCODE && input === process.env.ADMIN_PASSCODE;
}

export function adminCookieName(): string {
  return COOKIE_NAME;
}

export function adminCookieValue(): string {
  return expectedToken();
}

export function isAdminRequest(req: NextRequest): boolean {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  return !!cookie && cookie === expectedToken();
}
