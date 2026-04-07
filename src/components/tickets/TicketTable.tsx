"use client";

import { useMemo, useState } from "react";

import type { TicketListResult, TicketRecord } from "@/lib/types";
import { formatDateTime, formatHours } from "@/lib/utils";

const optionalColumns = [
  { key: "category", label: "Категорія" },
  { key: "priority", label: "Пріоритет" },
  { key: "status", label: "Статус" },
  { key: "assignee", label: "Виконавець" },
  { key: "resolutionTimeHours", label: "Час вирішення" },
] as const;

export function TicketTable({
  result,
  isLoading,
  onPageChange,
}: {
  result?: TicketListResult;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}) {
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    optionalColumns.map((column) => column.key),
  );

  const totalPages = useMemo(() => {
    if (!result) {
      return 1;
    }

    return Math.max(1, Math.ceil(result.total / result.limit));
  }, [result]);

  function toggleColumn(key: string) {
    setVisibleColumns((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Перелік тікетів</h2>
          <p className="text-sm text-zinc-500">Клік по рядку відкриває детальну картку тікета.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {optionalColumns.map((column) => (
            <label key={column.key} className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={visibleColumns.includes(column.key)}
                onChange={() => toggleColumn(column.key)}
              />
              {column.label}
            </label>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500">
              <th className="px-3 py-3">#</th>
              <th className="px-3 py-3">Tracking ID</th>
              <th className="px-3 py-3">Створено</th>
              {visibleColumns.includes("category") ? <th className="px-3 py-3">Категорія</th> : null}
              {visibleColumns.includes("priority") ? <th className="px-3 py-3">Пріоритет</th> : null}
              {visibleColumns.includes("status") ? <th className="px-3 py-3">Статус</th> : null}
              {visibleColumns.includes("assignee") ? <th className="px-3 py-3">Виконавець</th> : null}
              {visibleColumns.includes("resolutionTimeHours") ? <th className="px-3 py-3">Час вирішення</th> : null}
              <th className="px-3 py-3">Відповіді</th>
            </tr>
          </thead>
          <tbody>
            {result?.tickets.map((ticket) => (
              <tr
                key={ticket.trackingId}
                onClick={() => setSelectedTicket(ticket)}
                className="cursor-pointer border-b border-zinc-100 transition-colors hover:bg-zinc-50"
              >
                <td className="px-3 py-3 font-medium text-zinc-700">{ticket.ticketNumber ?? "—"}</td>
                <td className="px-3 py-3 font-medium text-violet-700">{ticket.trackingId}</td>
                <td className="px-3 py-3 text-zinc-600">{formatDateTime(ticket.createdAt)}</td>
                {visibleColumns.includes("category") ? (
                  <td className="px-3 py-3 text-zinc-600">{ticket.category ?? "—"}</td>
                ) : null}
                {visibleColumns.includes("priority") ? (
                  <td className="px-3 py-3 text-zinc-600">{ticket.priority ?? "—"}</td>
                ) : null}
                {visibleColumns.includes("status") ? (
                  <td className="px-3 py-3 text-zinc-600">{ticket.status ?? "—"}</td>
                ) : null}
                {visibleColumns.includes("assignee") ? (
                  <td className="px-3 py-3 text-zinc-600">{ticket.assignee ?? "—"}</td>
                ) : null}
                {visibleColumns.includes("resolutionTimeHours") ? (
                  <td className="px-3 py-3 text-zinc-600">{formatHours(ticket.resolutionTimeHours)}</td>
                ) : null}
                <td className="px-3 py-3 text-zinc-600">{ticket.totalReplies}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isLoading ? <p className="mt-4 text-sm text-zinc-500">Завантажуємо тікети...</p> : null}
      {!isLoading && (result?.tickets.length ?? 0) === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">За цими фільтрами тікетів не знайдено.</p>
      ) : null}

      <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
        <span>Всього: {result?.total ?? 0}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onPageChange((result?.page ?? 1) - 1)}
            disabled={!result || result.page <= 1}
            className="rounded-2xl border border-zinc-200 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Назад
          </button>
          <span>
            Сторінка {result?.page ?? 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange((result?.page ?? 1) + 1)}
            disabled={!result || result.page >= totalPages}
            className="rounded-2xl border border-zinc-200 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Далі
          </button>
        </div>
      </div>

      {selectedTicket ? (
        <div className="fixed inset-0 z-30 bg-black/40 p-4 lg:p-8">
          <div className="ml-auto h-full w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-zinc-500">{selectedTicket.trackingId}</p>
                <h3 className="mt-1 text-2xl font-semibold text-zinc-950">{selectedTicket.subject ?? "Без теми"}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
              >
                Закрити
              </button>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-zinc-500">Категорія</dt>
                <dd className="mt-1 font-medium text-zinc-900">{selectedTicket.category ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Статус</dt>
                <dd className="mt-1 font-medium text-zinc-900">{selectedTicket.status ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Пріоритет</dt>
                <dd className="mt-1 font-medium text-zinc-900">{selectedTicket.priority ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Виконавець</dt>
                <dd className="mt-1 font-medium text-zinc-900">{selectedTicket.assignee ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Створено</dt>
                <dd className="mt-1 font-medium text-zinc-900">{formatDateTime(selectedTicket.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Вирішено</dt>
                <dd className="mt-1 font-medium text-zinc-900">{formatDateTime(selectedTicket.resolvedAt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">URL тікета</dt>
                <dd className="mt-1 break-all font-medium text-violet-700">{selectedTicket.ticketUrl ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Час вирішення</dt>
                <dd className="mt-1 font-medium text-zinc-900">{formatHours(selectedTicket.resolutionTimeHours)}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <p className="text-sm text-zinc-500">Текст звернення</p>
              <div className="mt-2 rounded-2xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
                <pre className="whitespace-pre-wrap font-sans">{selectedTicket.body ?? "Немає тексту звернення."}</pre>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
