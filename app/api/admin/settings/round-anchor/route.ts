import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin";
import { getRoundAnchor, setRoundAnchor } from "@/lib/round";
import { formatDateOnly } from "@/lib/date";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  const anchor = await getRoundAnchor();
  return NextResponse.json({ anchor: formatDateOnly(anchor) });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const anchor = typeof body?.anchor === "string" ? body.anchor : "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(anchor)) {
    return NextResponse.json({ error: "날짜 형식이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    await setRoundAnchor(anchor);
  } catch {
    return NextResponse.json({ error: "유효하지 않은 날짜입니다." }, { status: 400 });
  }

  return NextResponse.json({ anchor });
}
