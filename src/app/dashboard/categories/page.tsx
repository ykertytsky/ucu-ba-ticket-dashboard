"use client";

import { useMemo } from "react";

import { BarChart } from "@/components/charts/BarChart";
import { GlobalFilterBar } from "@/components/filters/GlobalFilterBar";
import { HeatmapChart } from "@/components/charts/HeatmapChart";
import { useFilters } from "@/hooks/useFilters";
import { useMetrics } from "@/hooks/useMetrics";
import { useTickets } from "@/hooks/useTickets";

export default function CategoriesPage() {
  const { filters } = useFilters();
  const metrics = useMetrics(filters);
  const tickets = useTickets({ ...filters, limit: 200, page: 1 });

  const heatmap = useMemo(() => {
    const rows = Array.from(new Set((tickets.data?.tickets ?? []).map((item) => item.category ?? "Без категорії")));
    const columns = Array.from(new Set((tickets.data?.tickets ?? []).map((item) => item.priority ?? "Без пріоритету")));
    const values: Record<string, number> = {};

    for (const ticket of tickets.data?.tickets ?? []) {
      const row = ticket.category ?? "Без категорії";
      const column = ticket.priority ?? "Без пріоритету";
      const key = `${row}::${column}`;
      values[key] = (values[key] ?? 0) + 1;
    }

    return { rows, columns, values };
  }, [tickets.data]);

  const topSubjects = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ticket of tickets.data?.tickets ?? []) {
      const subject = ticket.subject ?? "Без теми";
      counts.set(subject, (counts.get(subject) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [tickets.data]);

  const categoryResolution = useMemo(() => {
    const grouped = new Map<string, number[]>();
    for (const ticket of tickets.data?.tickets ?? []) {
      if (ticket.resolutionTimeHours === null) {
        continue;
      }
      const key = ticket.category ?? "Без категорії";
      grouped.set(key, [...(grouped.get(key) ?? []), ticket.resolutionTimeHours]);
    }

    return Array.from(grouped.entries()).map(([category, values]) => ({
      category,
      avg: values.reduce((sum, value) => sum + value, 0) / values.length,
    }));
  }, [tickets.data]);

  return (
    <>
      <GlobalFilterBar />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Обсяг за категорією</h2>
          <div className="mt-4">
            <BarChart
              data={(metrics.data?.byCategory ?? []).map((item) => ({ category: item.category, count: item.count }))}
              labelKey="category"
              valueKey="count"
              horizontal
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Сер. час вирішення за категорією</h2>
          <div className="mt-4">
            <BarChart
              data={categoryResolution.map((item) => ({ category: item.category, avg: Number(item.avg.toFixed(1)) }))}
              labelKey="category"
              valueKey="avg"
              color="#ea580c"
              horizontal
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Категорія × Пріоритет</h2>
          <p className="mt-1 text-sm text-zinc-500">Щільність звернень у перетині категорій і рівнів важливості.</p>
          <div className="mt-4">
            <HeatmapChart rows={heatmap.rows} columns={heatmap.columns} values={heatmap.values} />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Топ теми звернень</h2>
          <div className="mt-4 space-y-3">
            {topSubjects.map(([subject, count]) => (
              <div key={subject} className="rounded-2xl bg-zinc-50 p-4">
                <p className="font-medium text-zinc-900">{subject}</p>
                <p className="mt-1 text-sm text-zinc-500">{count} звернень</p>
              </div>
            ))}
            {topSubjects.length === 0 ? (
              <p className="text-sm text-zinc-500">Недостатньо даних для побудови списку тем.</p>
            ) : null}
          </div>
        </div>
      </div>

      {filters.category.includes("Техпідтримка події") ? (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Події та локації</h2>
          <p className="mt-1 text-sm text-zinc-500">Додатковий зріз для категорії «Техпідтримка події».</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {(tickets.data?.tickets ?? [])
              .filter((ticket) => ticket.category === "Техпідтримка події")
              .slice(0, 6)
              .map((ticket) => (
                <div key={ticket.trackingId} className="rounded-2xl bg-zinc-50 p-4">
                  <p className="font-medium text-zinc-900">{ticket.subject}</p>
                  <p className="mt-1 text-sm text-zinc-500">{ticket.location ?? "Без локації"}</p>
                  <p className="mt-1 text-sm text-zinc-500">{ticket.eventDate ?? "Без дати"} · {ticket.eventTime ?? "Без часу"}</p>
                  <p className="mt-1 text-sm text-zinc-500">Кімната: {ticket.room ?? "—"}</p>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
