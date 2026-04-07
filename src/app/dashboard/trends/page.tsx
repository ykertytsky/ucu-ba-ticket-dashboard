"use client";

import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { useBatches } from "@/hooks/useBatches";

export default function TrendsPage() {
  const { data } = useBatches();
  const ready = (data?.batches.length ?? 0) >= 2;

  return (
    <>
      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
        {ready ? (
          <>
            <h2 className="text-2xl font-semibold text-zinc-950">Тренди готові до наступного проходу</h2>
            <p className="mt-3 text-zinc-500">
              Дані за кілька періодів уже є. У цьому MVP-проході сторінка лишається зарезервованою для другої ітерації порівнянь.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-zinc-950">Завантажте дані щонайменше за 2 різні місяці</h2>
            <p className="mt-3 text-zinc-500">
              Після цього тут з’являться лінійні графіки обсягу, рівня вирішення та зміни навантаження у часі.
            </p>
            <Link
              href="/dashboard/settings"
              className="mt-6 inline-flex rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white"
            >
              Завантажити дані
            </Link>
          </>
        )}
      </div>
    </>
  );
}
