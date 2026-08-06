"use client";

import { useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";

type Props = {
  selected: Date | null;
  onSelect: (date: Date) => void;
  disabledDates: Set<string>;
  maxDate?: Date;
};

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export function CalendarPicker({ selected, onSelect, disabledDates, maxDate }: Props) {
  const [cursor, setCursor] = useState(() => startOfMonth(selected ?? new Date()));
  const effectiveMax = maxDate ?? new Date();

  const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });

  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
    days.push(d);
  }

  return (
    <div className="rounded-xl border border-black/10 p-3 dark:border-white/10">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor((c) => addMonths(c, -1))}
          className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-black/5 dark:hover:bg-white/10"
        >
          ‹
        </button>
        <span className="text-sm font-semibold">{format(cursor, "yyyy년 M월")}</span>
        <button
          type="button"
          onClick={() => setCursor((c) => addMonths(c, 1))}
          className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-black/5 dark:hover:bg-white/10"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-gray-400">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, cursor);
          const isFuture = day > effectiveMax;
          const isLogged = disabledDates.has(key);
          const isDisabled = isFuture || isLogged || !inMonth;
          const isSelected = !!selected && isSameDay(day, selected);

          return (
            <button
              key={key}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(day)}
              className={[
                "aspect-square rounded-lg text-xs",
                !inMonth ? "invisible" : "",
                isSelected ? "bg-blue-600 text-white" : "",
                !isSelected && isLogged
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "",
                !isSelected && !isLogged && !isFuture && inMonth
                  ? "hover:bg-black/5 dark:hover:bg-white/10"
                  : "",
                isFuture && !isLogged ? "text-gray-300 dark:text-gray-700" : "",
              ].join(" ")}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-gray-400">
        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-400 align-middle" />
        인증완료 날짜는 다시 선택할 수 없어요
      </p>
    </div>
  );
}
