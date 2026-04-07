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

export function getActiveFilterPills(filters: FilterParams) {
  const pills = [
    ...filters.category.map((value) => ({ key: "category", value })),
    ...filters.priority.map((value) => ({ key: "priority", value })),
    ...filters.status.map((value) => ({ key: "status", value })),
    ...filters.assignee.map((value) => ({ key: "assignee", value })),
  ];

  if (filters.dateFrom) {
    pills.push({ key: "dateFrom", value: `Від ${filters.dateFrom}` });
  }

  if (filters.dateTo) {
    pills.push({ key: "dateTo", value: `До ${filters.dateTo}` });
  }

  if (filters.search) {
    pills.push({ key: "search", value: `Пошук: ${filters.search}` });
  }

  return pills;
}

export function getDateRangeLabel(filters: FilterParams) {
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
