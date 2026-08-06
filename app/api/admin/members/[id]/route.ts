import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);

  const data: { isActive?: boolean; weeklyGoal?: number } = {};

  if (body?.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }
    data.isActive = body.isActive;
  }

  if (body?.weeklyGoal !== undefined) {
    const weeklyGoal = Number(body.weeklyGoal);
    if (!Number.isInteger(weeklyGoal) || weeklyGoal < 1 || weeklyGoal > 7) {
      return NextResponse.json({ error: "목표 횟수는 1~7 사이여야 합니다." }, { status: 400 });
    }
    data.weeklyGoal = weeklyGoal;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const member = await prisma.member.update({ where: { id }, data });
  return NextResponse.json({ member });
}
