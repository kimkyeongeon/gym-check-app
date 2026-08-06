import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  try {
    const members = await prisma.member.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json({ members });
  } catch (err) {
    console.error("GET /api/admin/members failed", err);
    return NextResponse.json({ error: "DEBUG:" + String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const weeklyGoal = Number(body?.weeklyGoal ?? 3);

  if (!name) {
    return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
  }
  if (!Number.isInteger(weeklyGoal) || weeklyGoal < 1 || weeklyGoal > 7) {
    return NextResponse.json({ error: "목표 횟수는 1~7 사이여야 합니다." }, { status: 400 });
  }

  try {
    const member = await prisma.member.create({ data: { name, weeklyGoal } });
    return NextResponse.json({ member });
  } catch (err) {
    console.error("POST /api/admin/members failed", err);
    return NextResponse.json({ error: "DEBUG:" + String(err) }, { status: 500 });
  }
}
