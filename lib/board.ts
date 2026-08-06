import { prisma } from "@/lib/db";
import { formatDateOnly } from "@/lib/date";
import type { WeekRange } from "@/lib/week";

export type BoardLog = { id: string; date: string; driveFileId: string | null };
export type BoardEntry = {
  member: { id: string; name: string; weeklyGoal: number };
  achieved: number;
  logs: BoardLog[];
};

export async function getBoardData(range: WeekRange): Promise<BoardEntry[]> {
  const members = await prisma.member.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  const logs = await prisma.workoutLog.findMany({
    where: {
      memberId: { in: members.map((m) => m.id) },
      date: { gte: range.start, lte: range.end },
    },
    select: { id: true, memberId: true, date: true, driveFileId: true },
    orderBy: { date: "asc" },
  });

  return members.map((member) => {
    const memberLogs = logs.filter((l) => l.memberId === member.id);
    return {
      member: { id: member.id, name: member.name, weeklyGoal: member.weeklyGoal },
      achieved: memberLogs.length,
      logs: memberLogs.map((l) => ({
        id: l.id,
        date: formatDateOnly(l.date),
        driveFileId: l.driveFileId,
      })),
    };
  });
}
