"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemberContext } from "@/components/MemberContext";

const links = [
  { href: "/board", label: "현황판" },
  { href: "/upload", label: "인증하기" },
  { href: "/history", label: "히스토리" },
  { href: "/rounds", label: "회차 통계" },
  { href: "/admin", label: "관리자" },
];

export function NavBar() {
  const pathname = usePathname();
  const { currentMember } = useMemberContext();

  if (pathname === "/") return null;

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-white/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-black/80">
        <Link href="/board" className="font-semibold">
          오운완
        </Link>
        {currentMember && (
          <Link href="/" className="text-xs text-gray-500">
            {currentMember.name}님 · 변경
          </Link>
        )}
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-black/10 bg-white/95 py-2 backdrop-blur dark:border-white/10 dark:bg-black/90">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded px-2 py-1 text-xs ${
              pathname === l.href
                ? "font-semibold text-blue-600 dark:text-blue-400"
                : "text-gray-500"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
