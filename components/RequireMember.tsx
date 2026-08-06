"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMemberContext, type MemberSummary } from "@/components/MemberContext";

export function RequireMember({
  children,
}: {
  children: (member: MemberSummary) => React.ReactNode;
}) {
  const { currentMember, loading } = useMemberContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentMember) {
      router.replace("/");
    }
  }, [loading, currentMember, router]);

  if (loading) {
    return <p className="py-10 text-center text-sm text-gray-500">불러오는 중...</p>;
  }
  if (!currentMember) {
    return null;
  }

  return <>{children(currentMember)}</>;
}
