"use client";

import { AlertTriangle, CheckCircle2, Clock3, Ticket } from "lucide-react";

import { DailyVolumeChart } from "@/components/charts/DailyVolumeChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { KpiCard } from "@/components/cards/KpiCard";
import { GlobalFilterBar } from "@/components/filters/GlobalFilterBar";
import { useFilters } from "@/hooks/useFilters";
import { useMetrics } from "@/hooks/useMetrics";
import { formatHours, formatNumber, formatPercent } from "@/lib/utils";

export default function OverviewPage() {
  const { filters } = useFilters();
  const metrics = useMetrics(filters);
  const data = metrics.data;

  return (
    <>
      <GlobalFilterBar />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Всього тікетів"
          value={formatNumber(data?.totalTickets ?? 0)}
          delta={data?.deltas?.totalTickets}
          icon={<Ticket className="h-5 w-5" />}
        />
        <KpiCard
          label="Рівень вирішення"
          value={formatPercent(data?.resolutionRate ?? 0)}
          delta={data?.deltas?.resolutionRate}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <KpiCard
          label="Сер. час вирішення"
          value={formatHours(data?.avgResolutionHours ?? 0)}
          delta={data?.deltas?.avgResolutionHours}
          icon={<Clock3 className="h-5 w-5" />}
        />
        <KpiCard
          label="Без виконавця"
          value={formatNumber(data?.unassigned ?? 0)}
          delta={data?.deltas?.unassigned}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Тікети за статусом</h2>
          <p className="mt-1 text-sm text-zinc-500">Поточна структура портфеля звернень.</p>
          <div className="mt-4">
            <DonutChart
              data={(data?.byStatus ?? []).map((item) => ({ label: item.status, value: item.count }))}
              labelKey="label"
              valueKey="value"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Щоденний обсяг тікетів</h2>
          <p className="mt-1 text-sm text-zinc-500">Скільки звернень створюється щодня.</p>
          <div className="mt-4">
            <DailyVolumeChart data={data?.dailyVolume ?? []} />
          </div>
        </div>
      </div>
    </>
  );
}
