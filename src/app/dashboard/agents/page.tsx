"use client";

import { BarChart } from "@/components/charts/BarChart";
import { GlobalFilterBar } from "@/components/filters/GlobalFilterBar";
import { PageHeader } from "@/components/layout/PageHeader";
import { useFilters } from "@/hooks/useFilters";
import { useMetrics } from "@/hooks/useMetrics";
import { formatHours, formatPercent } from "@/lib/utils";

export default function AgentsPage() {
  const { filters } = useFilters();
  const { data } = useMetrics(filters);

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Навантаження на виконавців</h2>
          <p className="mt-1 text-sm text-zinc-500">Кількість призначених тікетів на кожного агента.</p>
          <div className="mt-4">
            <BarChart
              data={(data?.byAgent ?? []).slice(0, 10).map((item) => ({ assignee: item.assignee, count: item.count }))}
              labelKey="assignee"
              valueKey="count"
              horizontal
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Сер. час вирішення за агентом</h2>
          <p className="mt-1 text-sm text-zinc-500">Допомагає побачити вузькі місця у виконанні.</p>
          <div className="mt-4">
            <BarChart
              data={(data?.byAgent ?? []).slice(0, 10).map((item) => ({ assignee: item.assignee, avg: item.avgResolutionHours ?? 0 }))}
              labelKey="assignee"
              valueKey="avg"
              color="#0f766e"
              horizontal
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Зведена таблиця виконавців</h2>
        <p className="mt-1 text-sm text-zinc-500">Порівняйте кількість тікетів, рівень вирішення та активність у комунікації.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500">
                <th className="px-3 py-3">Виконавець</th>
                <th className="px-3 py-3">Всього</th>
                <th className="px-3 py-3">Відкриті</th>
                <th className="px-3 py-3">Рівень вирішення</th>
                <th className="px-3 py-3">Сер. час</th>
                <th className="px-3 py-3">Відповіді</th>
                <th className="px-3 py-3">Трекінг часу</th>
              </tr>
            </thead>
            <tbody>
              {(data?.byAgent ?? []).map((item) => {
                const resolutionRate = item.count > 0 ? (item.resolved / item.count) * 100 : 0;
                return (
                  <tr key={item.assignee} className="border-b border-zinc-100">
                    <td className="px-3 py-3 font-medium text-zinc-900">{item.assignee}</td>
                    <td className="px-3 py-3 text-zinc-600">{item.count}</td>
                    <td className="px-3 py-3 text-zinc-600">{item.open}</td>
                    <td className="px-3 py-3 text-zinc-600">{formatPercent(resolutionRate)}</td>
                    <td className="px-3 py-3 text-zinc-600">{formatHours(item.avgResolutionHours)}</td>
                    <td className="px-3 py-3 text-zinc-600">{item.staffReplies}</td>
                    <td className="px-3 py-3 text-zinc-600">{item.timeTrackedMinutes.toFixed(0)} хв</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
