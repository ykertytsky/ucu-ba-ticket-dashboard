"use client";

import { useState } from "react";
import { CalendarDays, RotateCcw } from "lucide-react";

import {
  DateCalendarPicker,
  MonthCalendarPicker,
} from "@/components/filters/CalendarPicker";
import { useFilters } from "@/hooks/useFilters";
import {
  getMonthRangeFromMonthValue,
  getMonthValueFromRange,
} from "@/lib/filters";

export function GlobalFilterBar() {
  const { defaultMonthRange, filters, replaceFilters, resetFilters } = useFilters();
  const activeMonthValue = getMonthValueFromRange(filters.dateFrom, filters.dateTo);
  const defaultMonthValue = getMonthValueFromRange(
    defaultMonthRange.dateFrom,
    defaultMonthRange.dateTo,
  );
  const [periodMode, setPeriodMode] = useState<"month" | "custom">(
    activeMonthValue ? "month" : "custom",
  );
  const monthValue = activeMonthValue || defaultMonthValue;

  function applyMonth(value: string) {
    const range = getMonthRangeFromMonthValue(value);
    if (!range) {
      return;
    }

    replaceFilters(range);
  }

  return (
    <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <CalendarDays className="h-4 w-4" />
            Період звіту
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Усі показники, графіки та таблиці рахуються тільки за обрані дати.
          </p>
        </div>

        <div className="inline-flex rounded-full bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => {
              setPeriodMode("month");
              applyMonth(monthValue);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              periodMode === "month"
                ? "bg-zinc-950 text-white"
                : "text-zinc-600 hover:bg-white"
            }`}
          >
            Місяць
          </button>
          <button
            type="button"
            onClick={() => setPeriodMode("custom")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              periodMode === "custom"
                ? "bg-zinc-950 text-white"
                : "text-zinc-600 hover:bg-white"
            }`}
          >
            Дати
          </button>
        </div>
      </div>

      {periodMode === "month" ? (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <MonthCalendarPicker
            label="Місяць"
            value={monthValue}
            onChange={applyMonth}
          />
          <button
            type="button"
            onClick={() => {
              setPeriodMode("month");
              resetFilters();
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <RotateCcw className="h-4 w-4" />
            Типовий місяць
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <DateCalendarPicker
            label="Дата від"
            value={filters.dateFrom}
            onChange={(dateFrom) => replaceFilters({ dateFrom })}
          />
          <DateCalendarPicker
            label="Дата до"
            value={filters.dateTo}
            onChange={(dateTo) => replaceFilters({ dateTo })}
          />
          <button
            type="button"
            onClick={() => {
              setPeriodMode("month");
              resetFilters();
            }}
            className="self-end inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <RotateCcw className="h-4 w-4" />
            Скинути
          </button>
        </div>
      )}
    </section>
  );
}
