"use client";

import { MemberProvider } from "@/components/MemberContext";
import { NavBar } from "@/components/NavBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MemberProvider>
      <NavBar />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-24">{children}</main>
    </MemberProvider>
  );
}
