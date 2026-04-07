"use client";

import { AlertTriangle, CheckCircle2, Clock3, ListTodo, Ticket } from "lucide-react";

import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { GlobalFilterBar } from "@/components/filters/GlobalFilterBar";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/cards/KpiCard";
import { NarrativeBox } from "@/components/cards/NarrativeBox";
import { useFilters } from "@/hooks/useFilters";
import { useMetrics } from "@/hooks/useMetrics";
import { useTickets } from "@/hooks/useTickets";
import { formatHours, formatNumber, formatPercent } from "@/lib/utils";

export default function OverviewPage() {
  const { filters } = useFilters();
  const metrics = useMetrics(filters);
  const openTickets = useTickets({ ...filters, openOnly: true, limit: 6, page: 1 });
  const data = metrics.data;

  return (
    <>
      <PageHeader
        title="Огляд"
        description="Швидка відповідь на головне питання: чи все гаразд із роботою helpdesk просто зараз. Тут зібрані ключові KPI, структура статусів і щоденна динаміка надходжень."
        info="Стежте за відкритими тікетами, часткою вирішених звернень і середнім часом вирішення. Якщо DQ-бейдж жовтий або червоний, інтерпретуйте показники обережно."
      />

      <GlobalFilterBar />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Всього тікетів"
          value={formatNumber(data?.totalTickets ?? 0)}
          delta={data?.deltas.totalTickets}
          icon={<Ticket className="h-5 w-5" />}
        />
        <KpiCard
          label="Рівень вирішення"
          value={formatPercent(data?.resolutionRate ?? 0)}
          delta={data?.deltas.resolutionRate}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <KpiCard
          label="Сер. час вирішення"
          value={formatHours(data?.avgResolutionHours ?? 0)}
          delta={data?.deltas.avgResolutionHours}
          icon={<Clock3 className="h-5 w-5" />}
        />
        <KpiCard
          label="Відкриті тікети"
          value={formatNumber(data?.openTickets ?? 0)}
          delta={data?.deltas.openTickets}
          icon={<ListTodo className="h-5 w-5" />}
        />
        <KpiCard
          label="Без виконавця"
          value={formatNumber(data?.unassigned ?? 0)}
          delta={data?.deltas.unassigned}
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
          <p className="mt-1 text-sm text-zinc-500">Скільки звернень створюється щодня в обраному періоді.</p>
          <div className="mt-4">
            <BarChart
              data={(data?.dailyVolume ?? []).map((item) => ({ date: item.date, count: item.count }))}
              labelKey="date"
              valueKey="count"
              color="#2563eb"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <NarrativeBox text={data?.narrative ?? "Дані завантажуються..."} />

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Відкриті тікети</h2>
          <p className="mt-1 text-sm text-zinc-500">Останні активні звернення без статусу «Вирішене».</p>
          <div className="mt-4 space-y-3">
            {(openTickets.data?.tickets ?? []).map((ticket) => (
              <div key={ticket.trackingId} className="rounded-2xl bg-zinc-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-violet-700">{ticket.trackingId}</p>
                    <p className="mt-1 font-medium text-zinc-950">{ticket.subject ?? "Без теми"}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {ticket.category ?? "Без категорії"} · {ticket.assignee ?? "Без виконавця"}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {ticket.status ?? "Без статусу"}
                  </span>
                </div>
              </div>
            ))}
            {(openTickets.data?.tickets.length ?? 0) === 0 ? (
              <p className="text-sm text-zinc-500">Активних тікетів за обраними фільтрами не знайдено.</p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
