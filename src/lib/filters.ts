import { format } from "date-fns";
import { uk } from "date-fns/locale";

import type { FilterParams } from "@/lib/types";

interface SearchParamsLike {
  get(name: string): string | null;
  getAll(name: string): string[];
}

type SearchParamInput = URLSearchParams | SearchParamsLike | Record<string, string | string[] | undefined>;

function isSearchParamsLike(input: SearchParamInput): input is SearchParamsLike {
  return typeof input === "object" && input !== null && "get" in input && "getAll" in input;
}

const multiValueKeys = ["category", "priority", "status", "assignee"] as const;

function getManyValues(
  input: SearchParamInput,
  key: (typeof multiValueKeys)[number],
) {
  if (isSearchParamsLike(input)) {
    return input.getAll(key).filter(Boolean);
  }

  const value = input[key];

  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function getSingleValue(input: SearchParamInput, key: string) {
  if (isSearchParamsLike(input)) {
    return input.get(key) ?? "";
  }

  const value = input[key];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function formatUtcDate(year: number, monthIndex: number, day: number) {
  return new Date(Date.UTC(year, monthIndex, day)).toISOString().slice(0, 10);
}

function capitalizeFirstLetter(value: string) {
  return value ? `${value[0]!.toUpperCase()}${value.slice(1)}` : value;
}

export function getMonthRangeFromMonthValue(
  value: string,
): { dateFrom: string; dateTo: string } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1]!, 10);
  const month = Number.parseInt(match[2]!, 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }

  return {
    dateFrom: formatUtcDate(year, month - 1, 1),
    dateTo: formatUtcDate(year, month, 0),
  };
}

export function getMonthRangeFromDateString(
  value: string,
): { dateFrom: string; dateTo: string } | null {
  const trimmed = value.trim();

  const yearPart = Number.parseInt(trimmed.slice(0, 4), 10);
  const monthPart = Number.parseInt(trimmed.slice(5, 7), 10);
  if (
    Number.isFinite(yearPart) &&
    Number.isFinite(monthPart) &&
    monthPart >= 1 &&
    monthPart <= 12
  ) {
    return getMonthRangeFromMonthValue(
      `${yearPart}-${String(monthPart).padStart(2, "0")}`,
    );
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const year = parsed.getUTCFullYear();
  const month = parsed.getUTCMonth();
  return {
    dateFrom: formatUtcDate(year, month, 1),
    dateTo: formatUtcDate(year, month + 1, 0),
  };
}

export function getCurrentMonthRange(referenceDate = new Date()) {
  return {
    dateFrom: formatUtcDate(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      1,
    ),
    dateTo: formatUtcDate(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + 1,
      0,
    ),
  };
}

export function getMonthValueFromRange(dateFrom: string, dateTo: string) {
  if (!dateFrom || !dateTo) {
    return "";
  }

  const monthRange = getMonthRangeFromDateString(dateFrom);
  if (!monthRange || monthRange.dateFrom !== dateFrom || monthRange.dateTo !== dateTo) {
    return "";
  }

  return dateFrom.slice(0, 7);
}

export function parseFilterParams(input: SearchParamInput): FilterParams {
  const page = Number.parseInt(getSingleValue(input, "page"), 10);
  const limit = Number.parseInt(getSingleValue(input, "limit"), 10);
  const openOnly = getSingleValue(input, "openOnly");

  return {
    dateFrom: getSingleValue(input, "dateFrom"),
    dateTo: getSingleValue(input, "dateTo"),
    category: getManyValues(input, "category"),
    priority: getManyValues(input, "priority"),
    status: getManyValues(input, "status"),
    assignee: getManyValues(input, "assignee"),
    search: getSingleValue(input, "search").trim(),
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 50,
    openOnly: openOnly === "1" || openOnly === "true",
  };
}

export function serializeFilters(filters: Partial<FilterParams>) {
  const params = new URLSearchParams();

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }

  if (filters.limit && filters.limit !== 50) {
    params.set("limit", String(filters.limit));
  }

  if (filters.openOnly) {
    params.set("openOnly", "1");
  }

  for (const key of multiValueKeys) {
    for (const value of filters[key] ?? []) {
      params.append(key, value);
    }
  }

  return params.toString();
}

export function getDateRangeLabel(filters: FilterParams) {
  const monthValue = getMonthValueFromRange(filters.dateFrom, filters.dateTo);
  if (monthValue) {
    return capitalizeFirstLetter(
      format(new Date(`${monthValue}-01T00:00:00`), "LLLL yyyy", { locale: uk }),
    );
  }

  if (filters.dateFrom && filters.dateTo) {
    return `${filters.dateFrom} - ${filters.dateTo}`;
  }

  if (filters.dateFrom) {
    return `від ${filters.dateFrom}`;
  }

  if (filters.dateTo) {
    return `до ${filters.dateTo}`;
  }

  return "Усі доступні дані";
}
