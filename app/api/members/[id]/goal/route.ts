import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const weeklyGoal = Number(body?.weeklyGoal);

  if (!Number.isInteger(weeklyGoal) || weeklyGoal < 1 || weeklyGoal > 7) {
    return NextResponse.json({ error: "목표 횟수는 1~7 사이여야 합니다." }, { status: 400 });
  }

  const member = await prisma.member.findUnique({ where: { id } });
  if (!member || !member.isActive) {
    return NextResponse.json({ error: "유효하지 않은 멤버입니다." }, { status: 404 });
  }

  const updated = await prisma.member.update({
    where: { id },
    data: { weeklyGoal },
  });

  return NextResponse.json({
    member: { id: updated.id, name: updated.name, weeklyGoal: updated.weeklyGoal },
  });
}
