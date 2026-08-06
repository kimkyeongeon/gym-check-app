import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createThumbnail } from "@/lib/image";
import { uploadOriginal } from "@/lib/drive";
import { parseDateOnly, todayKST } from "@/lib/date";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const memberId = formData.get("memberId");
  const dateStr = formData.get("date");
  const file = formData.get("file");

  if (typeof memberId !== "string" || !memberId) {
    return NextResponse.json({ error: "멤버를 선택해주세요." }, { status: 400 });
  }
  if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json({ error: "날짜를 선택해주세요." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "사진을 선택해주세요." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
  }

  let date: Date;
  try {
    date = parseDateOnly(dateStr);
  } catch {
    return NextResponse.json({ error: "날짜 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (date.getTime() > todayKST().getTime()) {
    return NextResponse.json({ error: "미래 날짜는 인증할 수 없습니다." }, { status: 400 });
  }

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member || !member.isActive) {
    return NextResponse.json({ error: "유효하지 않은 멤버입니다." }, { status: 400 });
  }

  const existing = await prisma.workoutLog.findUnique({
    where: { memberId_date: { memberId, date } },
  });
  if (existing) {
    return NextResponse.json({ error: "이미 인증한 날짜입니다." }, { status: 409 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const thumbnail = await createThumbnail(buffer);

  const monthKey = dateStr.slice(0, 7); // yyyy-MM
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const fileName = `${member.name}_${dateStr}.${ext}`;

  let driveResult: { fileId: string; fileUrl: string };
  try {
    driveResult = await uploadOriginal({
      buffer,
      fileName,
      mimeType: file.type,
      monthKey,
    });
  } catch (err) {
    console.error("Drive upload failed", err);
    return NextResponse.json(
      { error: "DEBUG:" + String(err) + " | " + JSON.stringify((err as { errors?: unknown })?.errors ?? null) },
      { status: 502 },
    );
  }

  try {
    const log = await prisma.workoutLog.create({
      data: {
        memberId,
        date,
        driveFileId: driveResult.fileId,
        driveFileUrl: driveResult.fileUrl,
        thumbnail: new Uint8Array(thumbnail),
      },
    });
    return NextResponse.json({ id: log.id });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "이미 인증한 날짜입니다." }, { status: 409 });
    }
    throw err;
  }
}
