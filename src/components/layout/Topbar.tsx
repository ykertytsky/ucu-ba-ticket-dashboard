"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload } from "lucide-react";

import { getDateRangeLabel } from "@/lib/filters";
import { useFilters } from "@/hooks/useFilters";

const pageTitles: Record<string, string> = {
  "/dashboard": "Огляд",
  "/dashboard/tickets": "Тікети",
  "/dashboard/agents": "Виконавці",
  "/dashboard/categories": "Категорії",
  "/dashboard/settings": "Налаштування",
};

export function Topbar() {
  const pathname = usePathname();
  const { filters } = useFilters();
  const title = pageTitles[pathname] ?? "UCU IT Helpdesk";

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 px-6 py-4 backdrop-blur">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-950">{title}</h1>
            <p className="text-sm text-zinc-500">Період: {getDateRangeLabel(filters)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/api/auth/logout"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Вийти
            </Link>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
            >
              <Upload className="h-4 w-4" />
              Завантажити дані
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
