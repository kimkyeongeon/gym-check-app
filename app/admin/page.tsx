"use client";

import { useEffect, useState } from "react";
import { useMemberContext } from "@/components/MemberContext";

type AdminMember = { id: string; name: string; weeklyGoal: number; isActive: boolean };

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "로그인에 실패했습니다.");
        return;
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-sm text-gray-500">관리자 비밀번호를 입력해주세요.</p>
      <input
        type="password"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
        className="rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-transparent"
        placeholder="비밀번호"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "확인 중..." : "확인"}
      </button>
    </form>
  );
}

function MemberManager() {
  const { refreshMembers } = useMemberContext();
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [name, setName] = useState("");
  const [weeklyGoal, setWeeklyGoal] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/members", { cache: "no-store" });
    const data = await res.json();
    setMembers(data.members ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch member list on mount
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), weeklyGoal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "추가에 실패했습니다.");
        return;
      }
      setName("");
      setWeeklyGoal(3);
      await load();
      await refreshMembers();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(member: AdminMember) {
    await fetch(`/api/admin/members/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !member.isActive }),
    });
    await load();
    await refreshMembers();
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-2 rounded-xl border border-black/10 p-3 dark:border-white/10"
      >
        <h2 className="text-sm font-semibold">멤버 추가</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          className="rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-transparent"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">주간 목표</span>
          <input
            type="number"
            min={1}
            max={7}
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoal(Number(e.target.value))}
            className="w-16 rounded-lg border border-black/10 px-2 py-1 text-sm dark:border-white/10 dark:bg-transparent"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          추가
        </button>
      </form>

      <div>
        <h2 className="mb-2 text-sm font-semibold">멤버 목록</h2>
        <ul className="flex flex-col gap-2">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-xl border border-black/10 px-3 py-2 dark:border-white/10"
            >
              <div>
                <p className={`font-medium ${!m.isActive ? "text-gray-400 line-through" : ""}`}>
                  {m.name}
                </p>
                <p className="text-xs text-gray-400">주 {m.weeklyGoal}회</p>
              </div>
              <button
                type="button"
                onClick={() => toggleActive(m)}
                className={`rounded-lg border px-3 py-1 text-xs ${
                  m.isActive
                    ? "border-red-200 text-red-500 dark:border-red-900"
                    : "border-green-200 text-green-600 dark:border-green-900"
                }`}
              >
                {m.isActive ? "삭제" : "복구"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setAuthed(!!data.authed))
      .catch(() => setAuthed(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">관리자</h1>
      {authed === null ? (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      ) : authed ? (
        <MemberManager />
      ) : (
        <LoginForm onSuccess={() => setAuthed(true)} />
      )}
    </div>
  );
}
