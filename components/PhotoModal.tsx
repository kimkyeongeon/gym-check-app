"use client";

import type { BoardLog } from "@/lib/board";

export function PhotoModal({ log, onClose }: { log: BoardLog; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-3 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/photo/${log.id}`}
          alt={`${log.date} 인증 사진`}
          className="w-full rounded-lg object-cover"
        />
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-500">{log.date}</span>
          {log.driveFileId ? (
            <a
              href={`https://drive.google.com/file/d/${log.driveFileId}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              원본 보기
            </a>
          ) : (
            <span className="text-gray-400">원본 파일이 삭제되었습니다</span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-lg border border-black/10 py-2 text-sm dark:border-white/10"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
