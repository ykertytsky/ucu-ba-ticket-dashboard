"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { cn, formatDate } from "@/lib/utils";

const monthNames = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

const weekdayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

function parseDateValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1]!, 10);
  const month = Number.parseInt(match[2]!, 10) - 1;
  const day = Number.parseInt(match[3]!, 10);
  const date = new Date(year, month, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseMonthValue(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1]!, 10);
  const month = Number.parseInt(match[2]!, 10) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 0 || month > 11) {
    return null;
  }

  return { year, month };
}

function formatMonthValue(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function buildCalendarDays(viewDate: Date) {
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const firstVisible = new Date(firstOfMonth);
  firstVisible.setDate(firstOfMonth.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstVisible);
    date.setDate(firstVisible.getDate() + index);
    return date;
  });
}

interface MonthCalendarPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function MonthCalendarPicker({
  label,
  value,
  onChange,
}: MonthCalendarPickerProps) {
  const selected = parseMonthValue(value);
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(selected?.year ?? new Date().getFullYear());

  function openPicker() {
    setYear(selected?.year ?? new Date().getFullYear());
    setOpen((current) => !current);
  }

  return (
    <div className="relative min-w-56 flex-1">
      <p className="text-sm font-medium text-zinc-700">{label}</p>
      <button
        type="button"
        onClick={openPicker}
        className="mt-2 flex w-full items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-left text-sm text-zinc-900 outline-none transition-colors hover:bg-zinc-50 focus:border-violet-400"
      >
        <span>
          {selected ? `${monthNames[selected.month]} ${selected.year}` : "Оберіть місяць"}
        </span>
        <CalendarDays className="h-4 w-4 text-zinc-500" />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-30 mt-2 w-80 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setYear((current) => current - 1)}
              className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100"
              aria-label="Попередній рік"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="font-semibold text-zinc-950">{year}</div>
            <button
              type="button"
              onClick={() => setYear((current) => current + 1)}
              className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100"
              aria-label="Наступний рік"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {monthNames.map((monthName, monthIndex) => {
              const monthValue = formatMonthValue(year, monthIndex);
              const active = monthValue === value;
              return (
                <button
                  key={monthName}
                  type="button"
                  onClick={() => {
                    onChange(monthValue);
                    setOpen(false);
                  }}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-700 hover:bg-zinc-100",
                  )}
                >
                  {monthName}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface DateCalendarPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function DateCalendarPicker({
  label,
  value,
  onChange,
}: DateCalendarPickerProps) {
  const selected = parseDateValue(value);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selected ?? new Date());
  const days = buildCalendarDays(viewDate);

  function openPicker() {
    setViewDate(selected ?? new Date());
    setOpen((current) => !current);
  }

  return (
    <div className="relative">
      <p className="text-sm font-medium text-zinc-700">{label}</p>
      <button
        type="button"
        onClick={openPicker}
        className="mt-2 flex w-full items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-left text-sm text-zinc-900 outline-none transition-colors hover:bg-zinc-50 focus:border-violet-400"
      >
        <span>{selected ? formatDate(value) : "Оберіть дату"}</span>
        <CalendarDays className="h-4 w-4 text-zinc-500" />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-30 mt-2 w-80 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setViewDate(
                  (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                )
              }
              className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100"
              aria-label="Попередній місяць"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="font-semibold text-zinc-950">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            <button
              type="button"
              onClick={() =>
                setViewDate(
                  (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                )
              }
              className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100"
              aria-label="Наступний місяць"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-500">
            {weekdayNames.map((weekday) => (
              <div key={weekday} className="py-1">
                {weekday}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayValue = formatDateValue(day);
              const inCurrentMonth = day.getMonth() === viewDate.getMonth();
              const active = dayValue === value;
              return (
                <button
                  key={dayValue}
                  type="button"
                  onClick={() => {
                    onChange(dayValue);
                    setOpen(false);
                  }}
                  className={cn(
                    "aspect-square rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-700 hover:bg-zinc-100",
                    !active && !inCurrentMonth ? "text-zinc-300" : "",
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
