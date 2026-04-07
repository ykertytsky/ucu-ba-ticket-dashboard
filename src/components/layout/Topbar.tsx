"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RotateCcw, ShieldAlert, Upload } from "lucide-react";

import { getActiveFilterPills, getDateRangeLabel } from "@/lib/filters";
import { getScoreTone } from "@/lib/utils";
import { useFilters } from "@/hooks/useFilters";
import { useMetrics } from "@/hooks/useMetrics";

const pageTitles: Record<string, string> = {
  "/dashboard": "Огляд",
  "/dashboard/tickets": "Тікети",
  "/dashboard/agents": "Виконавці",
  "/dashboard/categories": "Категорії",
  "/dashboard/trends": "Тренди",
  "/dashboard/data-quality": "Якість даних",
  "/dashboard/settings": "Налаштування",
};

export function Topbar() {
  const pathname = usePathname();
  const { filters, removePill, resetFilters } = useFilters();
  const pills = getActiveFilterPills(filters);
  const { data } = useMetrics(filters);
  const title = pageTitles[pathname] ?? "UCU IT Helpdesk";
  const score = data?.dataQualityScore;
  const tone = score !== undefined ? getScoreTone(score) : null;

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 px-6 py-4 backdrop-blur">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-950">{title}</h1>
            <p className="text-sm text-zinc-500">{getDateRangeLabel(filters)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
            >
              <RotateCcw className="h-4 w-4" />
              Скинути фільтри
            </button>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
            >
              <Upload className="h-4 w-4" />
              Завантажити дані
            </Link>
            <Link
              href="/dashboard/data-quality"
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium ${
                tone === "good"
                  ? "bg-emerald-50 text-emerald-700"
                  : tone === "fair"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-rose-50 text-rose-700"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              {score !== undefined ? `DQ ${score.toFixed(0)}` : "Якість даних"}
            </Link>
          </div>
        </div>
        {pills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {pills.map((pill) => (
              <button
                key={`${pill.key}-${pill.value}`}
                type="button"
                onClick={() => removePill(pill.key, pill.value)}
                className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 transition-colors hover:bg-zinc-200"
              >
                {pill.value} ×
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}
