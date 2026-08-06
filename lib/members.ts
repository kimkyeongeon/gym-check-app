import { prisma } from "@/lib/db";

export function getActiveMembers() {
  return prisma.member.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
}

export function getMemberById(id: string) {
  return prisma.member.findUnique({ where: { id } });
}
