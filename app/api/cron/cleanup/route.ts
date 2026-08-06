import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteOriginal } from "@/lib/drive";

export const runtime = "nodejs";
export const maxDuration = 60;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - THIRTY_DAYS_MS);

  const targets = await prisma.workoutLog.findMany({
    where: {
      driveFileId: { not: null },
      uploadedAt: { lt: cutoff },
    },
    select: { id: true, driveFileId: true },
  });

  let deleted = 0;
  let failed = 0;

  for (const log of targets) {
    try {
      await deleteOriginal(log.driveFileId as string);
      await prisma.workoutLog.update({
        where: { id: log.id },
        data: { driveFileId: null, driveFileUrl: null, originalDeletedAt: new Date() },
      });
      deleted++;
    } catch (err) {
      console.error(`Failed to delete Drive file for log ${log.id}`, err);
      failed++;
    }
  }

  return NextResponse.json({ checked: targets.length, deleted, failed });
}
