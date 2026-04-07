"use client";

import { Trash2 } from "lucide-react";
import { mutate } from "swr";

import { useBatches } from "@/hooks/useBatches";
import { formatDate, formatDateTime } from "@/lib/utils";

export function BatchHistory() {
  const { data, error, isLoading } = useBatches();

  async function handleDelete(id: string) {
    if (!window.confirm("Видалити пакет і всі пов'язані тікети?")) {
      return;
    }

    await fetch(`/api/batches/${id}`, { method: "DELETE" });
    await mutate((key) => typeof key === "string" && key.startsWith("/api/"));
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Історія імпортів</h2>
          <p className="text-sm text-zinc-500">Керуйте пакетами, які формують аналітику.</p>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-zinc-500">Завантажуємо пакети...</p> : null}
      {error ? <p className="text-sm text-rose-600">Не вдалося завантажити пакети.</p> : null}

      <div className="space-y-3">
        {(data?.batches ?? []).map((batch) => (
          <div key={batch.id} className="rounded-2xl border border-zinc-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-zinc-950">{batch.filename}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {formatDate(batch.periodStart)} - {formatDate(batch.periodEnd)} · {batch.ticketCount} тікетів · завантажено {formatDateTime(batch.uploadedAt)}
                </p>
                <p className="mt-1 text-sm text-zinc-500">Оновлені дублікати: {batch.duplicatesUpdated}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(batch.id)}
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
                Видалити
              </button>
            </div>
          </div>
        ))}

        {!isLoading && (data?.batches ?? []).length === 0 ? (
          <p className="text-sm text-zinc-500">Пакетів ще немає. Завантажте перший XML, щоб розпочати аналіз.</p>
        ) : null}
      </div>
    </div>
  );
}
