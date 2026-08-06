import { NextRequest, NextResponse } from "next/server";
import { formatDateOnly } from "@/lib/date";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const memberId = req.nextUrl.searchParams.get("memberId");
  if (!memberId) {
    return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  }

  const logs = await prisma.workoutLog.findMany({
    where: { memberId },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({
    dates: logs.map((l) => formatDateOnly(l.date)),
  });
}
