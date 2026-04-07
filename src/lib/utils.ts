import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatHours(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  return `${value.toFixed(1)} год`;
}

export function formatMinutes(value: number) {
  return `${Math.round(value)} хв`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("uk-UA").format(value);
}

export function formatDate(value: string | null, fallback = "—") {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return format(parsed, "d MMM yyyy", { locale: uk });
}

export function formatDateTime(value: string | null, fallback = "—") {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return format(parsed, "d MMM yyyy, HH:mm", { locale: uk });
}

export function getScoreTone(score: number) {
  if (score >= 90) {
    return "good";
  }

  if (score >= 70) {
    return "fair";
  }

  return "poor";
}

export async function fetchJson<T>(url: string) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed for ${url}`);
  }

  return (await response.json()) as T;
}
