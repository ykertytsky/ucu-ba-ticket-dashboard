import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  helper?: string;
  delta?: number | null;
  icon?: ReactNode;
}

export function KpiCard({ label, value, helper, delta, icon }: KpiCardProps) {
  const deltaTone =
    delta === null || delta === undefined
      ? "text-zinc-500"
      : delta > 0
        ? "text-emerald-600"
        : delta < 0
          ? "text-rose-600"
          : "text-zinc-500";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-zinc-950">{value}</p>
        </div>
        {icon ? <div className="rounded-xl bg-zinc-100 p-2 text-zinc-700">{icon}</div> : null}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 text-sm">
        <span className={cn("font-medium", deltaTone)}>
          {delta === null || delta === undefined ? "Немає попереднього періоду" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`}
        </span>
        {helper ? <span className="text-zinc-500">{helper}</span> : null}
      </div>
    </div>
  );
}
