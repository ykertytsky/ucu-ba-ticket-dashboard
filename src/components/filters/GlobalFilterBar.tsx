"use client";

import { useEffect, useState } from "react";

import { useFilterOptions } from "@/hooks/useFilterOptions";
import { useFilters } from "@/hooks/useFilters";

function readMultiSelect(event: React.ChangeEvent<HTMLSelectElement>) {
  return Array.from(event.target.selectedOptions).map((option) => option.value);
}

export function GlobalFilterBar() {
  const { filters, replaceFilters } = useFilters();
  const { data: options } = useFilterOptions();
  const [formState, setFormState] = useState(filters);

  useEffect(() => {
    setFormState(filters);
  }, [filters]);

  return (
    <form
      className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        replaceFilters(formState);
      }}
    >
      <div className="grid gap-4 lg:grid-cols-4">
        <label className="text-sm font-medium text-zinc-700">
          Пошук
          <input
            value={formState.search}
            onChange={(event) =>
              setFormState((current) => ({ ...current, search: event.target.value }))
            }
            placeholder="Тема, текст або tracking ID"
            className="mt-2 w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm outline-none transition-colors focus:border-violet-400"
          />
        </label>
        <label className="text-sm font-medium text-zinc-700">
          Дата від
          <input
            type="date"
            value={formState.dateFrom}
            onChange={(event) =>
              setFormState((current) => ({ ...current, dateFrom: event.target.value }))
            }
            className="mt-2 w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm outline-none transition-colors focus:border-violet-400"
          />
        </label>
        <label className="text-sm font-medium text-zinc-700">
          Дата до
          <input
            type="date"
            value={formState.dateTo}
            onChange={(event) =>
              setFormState((current) => ({ ...current, dateTo: event.target.value }))
            }
            className="mt-2 w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm outline-none transition-colors focus:border-violet-400"
          />
        </label>
        <label className="flex items-end gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700">
          <input
            type="checkbox"
            checked={formState.openOnly}
            onChange={(event) =>
              setFormState((current) => ({ ...current, openOnly: event.target.checked }))
            }
            className="h-4 w-4 rounded border-zinc-300"
          />
          Лише відкриті тікети
        </label>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        <label className="text-sm font-medium text-zinc-700">
          Категорії
          <select
            multiple
            value={formState.category}
            onChange={(event) =>
              setFormState((current) => ({ ...current, category: readMultiSelect(event) }))
            }
            className="mt-2 h-36 w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm outline-none transition-colors focus:border-violet-400"
          >
            {(options?.categories ?? []).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-zinc-700">
          Пріоритети
          <select
            multiple
            value={formState.priority}
            onChange={(event) =>
              setFormState((current) => ({ ...current, priority: readMultiSelect(event) }))
            }
            className="mt-2 h-36 w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm outline-none transition-colors focus:border-violet-400"
          >
            {(options?.priorities ?? []).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-zinc-700">
          Статуси
          <select
            multiple
            value={formState.status}
            onChange={(event) =>
              setFormState((current) => ({ ...current, status: readMultiSelect(event) }))
            }
            className="mt-2 h-36 w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm outline-none transition-colors focus:border-violet-400"
          >
            {(options?.statuses ?? []).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-zinc-700">
          Виконавці
          <select
            multiple
            value={formState.assignee}
            onChange={(event) =>
              setFormState((current) => ({ ...current, assignee: readMultiSelect(event) }))
            }
            className="mt-2 h-36 w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm outline-none transition-colors focus:border-violet-400"
          >
            {(options?.assignees ?? []).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Застосувати фільтри
        </button>
      </div>
    </form>
  );
}
