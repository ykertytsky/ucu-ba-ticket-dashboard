"use client";

import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { useFilters } from "@/hooks/useFilters";
import { useMetrics } from "@/hooks/useMetrics";
import { getScoreTone } from "@/lib/utils";

export default function DataQualityPage() {
  const { filters } = useFilters();
  const { data } = useMetrics(filters);
  const tone = getScoreTone(data?.dataQualityScore ?? 0);

  return (
    <>
      <PageHeader
        title="Якість даних"
        description="Ця сторінка відповідає на питання, наскільки можна довіряти цифрам на інших екранах. Вона не приховує проблеми, а робить їх явними."
        info="Зелений бал означає добру якість даних, жовтий — помірні ризики, червоний — суттєві обмеження для аналітики."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Загальний бал</p>
          <div className="mt-4 flex items-end gap-4">
            <span className={`text-6xl font-semibold ${tone === "good" ? "text-emerald-600" : tone === "fair" ? "text-amber-600" : "text-rose-600"}`}>
              {data?.dataQualityScore.toFixed(0) ?? "0"}
            </span>
            <span className="pb-2 text-sm text-zinc-500">зі 100</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Поле <strong>«Перша відповідь о»</strong> зламане у всіх HESK-експортах, тому SLA за першою відповіддю навмисно не показуються.
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Поля СЕДО не інтегровані з HESK і в більшості випадків залишаються порожніми.
          </p>
          <Link
            href="/dashboard/settings"
            className="mt-5 inline-flex rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white"
          >
            Керувати пакетами даних
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Правила оцінки</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-500">
                  <th className="px-3 py-3">Правило</th>
                  <th className="px-3 py-3">Зачеплено</th>
                  <th className="px-3 py-3">Критичність</th>
                  <th className="px-3 py-3">Вплив на бал</th>
                </tr>
              </thead>
              <tbody>
                {(data?.dataQualityRules ?? []).map((rule) => (
                  <tr key={rule.id} className="border-b border-zinc-100 align-top">
                    <td className="px-3 py-3">
                      <p className="font-medium text-zinc-900">{rule.title}</p>
                      <p className="mt-1 text-zinc-500">{rule.description}</p>
                    </td>
                    <td className="px-3 py-3 text-zinc-600">{rule.affectedCount}</td>
                    <td className="px-3 py-3 text-zinc-600">{rule.severity}</td>
                    <td className="px-3 py-3 font-medium text-rose-600">{rule.scoreImpact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Заповненість полів</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500">
                <th className="px-3 py-3">Поле</th>
                <th className="px-3 py-3">Fill rate</th>
                <th className="px-3 py-3">Статус</th>
              </tr>
            </thead>
            <tbody>
              {(data?.fieldCompleteness ?? []).map((item) => (
                <tr key={item.field} className="border-b border-zinc-100">
                  <td className="px-3 py-3 font-medium text-zinc-900">{item.field}</td>
                  <td className="px-3 py-3 text-zinc-600">{(item.fillRate * 100).toFixed(0)}%</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "good" ? "bg-emerald-100 text-emerald-700" : item.status === "fair" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
