import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const log = await prisma.workoutLog.findUnique({
    where: { id },
    select: { thumbnail: true, thumbnailMimeType: true },
  });

  if (!log) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(log.thumbnail), {
    headers: {
      "Content-Type": log.thumbnailMimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
