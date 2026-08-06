import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const members = await prisma.member.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, weeklyGoal: true },
  });
  return NextResponse.json({ members });
}
