"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { RequireMember } from "@/components/RequireMember";
import { CalendarPicker } from "@/components/CalendarPicker";

const COMPRESS_THRESHOLD_BYTES = 4 * 1024 * 1024;
const MAX_EDGE_PX = 2200;
const JPEG_QUALITY = 0.85;

async function compressIfNeeded(file: File): Promise<File> {
  if (file.size <= COMPRESS_THRESHOLD_BYTES || !file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const scale = Math.min(1, MAX_EDGE_PX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        JPEG_QUALITY,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

function UploadForm({ memberId }: { memberId: string }) {
  const [loggedDates, setLoggedDates] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadDates() {
    const res = await fetch(`/api/logs/mine?memberId=${memberId}`, { cache: "no-store" });
    const data = await res.json();
    setLoggedDates(new Set<string>(data.dates ?? []));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch already-logged dates on mount/member change
    loadDates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setError(null);
    setSuccess(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return f ? URL.createObjectURL(f) : null;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedDate) {
      setError("날짜를 선택해주세요.");
      return;
    }
    if (!file) {
      setError("사진을 선택해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const uploadFile = await compressIfNeeded(file);
      const formData = new FormData();
      formData.append("memberId", memberId);
      formData.append("date", format(selectedDate, "yyyy-MM-dd"));
      formData.append("file", uploadFile);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "업로드에 실패했습니다.");
        return;
      }

      setSuccess("인증이 완료되었습니다!");
      setFile(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setSelectedDate(null);
      await loadDates();
    } catch {
      setError("업로드 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="mb-2 text-sm font-semibold">날짜 선택</h2>
        <CalendarPicker
          selected={selectedDate}
          onSelect={(d) => {
            setSelectedDate(d);
            setError(null);
          }}
          disabledDates={loggedDates}
        />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold">
          사진 업로드{selectedDate ? ` · ${format(selectedDate, "yyyy-MM-dd")}` : ""}
        </h2>
        <label className="flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-black/20 dark:border-white/20">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="선택한 사진 미리보기" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm text-gray-400">사진을 선택하세요</span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {submitting ? "업로드 중..." : "인증하기"}
      </button>
    </form>
  );
}

export default function UploadPage() {
  return (
    <div className="pb-4">
      <h1 className="mb-4 text-xl font-bold">운동 인증</h1>
      <RequireMember>{(member) => <UploadForm memberId={member.id} />}</RequireMember>
    </div>
  );
}
