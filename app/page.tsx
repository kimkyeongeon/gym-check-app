"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemberContext } from "@/components/MemberContext";

export default function HomePage() {
  const router = useRouter();
  const { members, loading, selectMember } = useMemberContext();

  function handleSelect(id: string) {
    selectMember(id);
    router.push("/board");
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">오운완</h1>
        <p className="mt-1 text-sm text-gray-500">본인 이름을 선택해주세요</p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      ) : members.length === 0 ? (
        <p className="max-w-xs text-sm text-gray-400">
          등록된 멤버가 없습니다. 관리자 화면에서 멤버를 추가해주세요.
        </p>
      ) : (
        <div className="grid w-full max-w-xs grid-cols-2 gap-3">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => handleSelect(m.id)}
              className="rounded-xl border border-black/10 px-2 py-4 text-center font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      <Link href="/admin" className="text-xs text-gray-400 underline">
        관리자
      </Link>
    </div>
  );
}
