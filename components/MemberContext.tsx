"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type MemberSummary = { id: string; name: string; weeklyGoal: number };

type MemberContextValue = {
  members: MemberSummary[];
  currentMember: MemberSummary | null;
  loading: boolean;
  selectMember: (id: string) => void;
  clearMember: () => void;
  refreshMembers: () => Promise<void>;
};

const STORAGE_KEY = "gymcheck.memberId";

const MemberContext = createContext<MemberContextValue | null>(null);

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMembers = useCallback(async () => {
    const res = await fetch("/api/members", { cache: "no-store" });
    const data = await res.json();
    setMembers(data.members ?? []);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage on mount
    setMemberId(stored);
    refreshMembers().finally(() => setLoading(false));
  }, [refreshMembers]);

  const selectMember = useCallback((id: string) => {
    window.localStorage.setItem(STORAGE_KEY, id);
    setMemberId(id);
  }, []);

  const clearMember = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setMemberId(null);
  }, []);

  const currentMember = members.find((m) => m.id === memberId) ?? null;

  return (
    <MemberContext.Provider
      value={{ members, currentMember, loading, selectMember, clearMember, refreshMembers }}
    >
      {children}
    </MemberContext.Provider>
  );
}

export function useMemberContext() {
  const ctx = useContext(MemberContext);
  if (!ctx) throw new Error("useMemberContext must be used within MemberProvider");
  return ctx;
}
