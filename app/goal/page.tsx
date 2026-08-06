"use client";

import { useState } from "react";
import { RequireMember } from "@/components/RequireMember";
import { useMemberContext } from "@/components/MemberContext";

function GoalForm({ memberId, initialGoal }: { memberId: string; initialGoal: number }) {
  const { refreshMembers } = useMemberContext();
  const [goal, setGoal] = useState(initialGoal);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/members/${memberId}/goal`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklyGoal: goal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "저장에 실패했습니다.");
        return;
      }
      await refreshMembers();
      setMessage("저장되었습니다.");
    } catch {
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-gray-500">주간 목표 운동 횟수</p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setGoal((g) => Math.max(1, g - 1))}
          className="h-10 w-10 rounded-full border border-black/10 text-lg dark:border-white/10"
        >
          −
        </button>
        <span className="w-12 text-center text-3xl font-bold">{goal}</span>
        <button
          type="button"
          onClick={() => setGoal((g) => Math.min(7, g + 1))}
          className="h-10 w-10 rounded-full border border-black/10 text-lg dark:border-white/10"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full max-w-xs rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? "저장 중..." : "저장"}
      </button>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default function GoalPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">목표 설정</h1>
      <RequireMember>
        {(member) => <GoalForm memberId={member.id} initialGoal={member.weeklyGoal} />}
      </RequireMember>
    </div>
  );
}
