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

  if (typeof body?.isActive !== "boolean") {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const member = await prisma.member.update({
    where: { id },
    data: { isActive: body.isActive },
  });
  return NextResponse.json({ member });
}
