"use client";

import useSWR from "swr";

import { serializeFilters } from "@/lib/filters";
import type { FilterParams, MetricsPayload } from "@/lib/types";
import { fetchJson } from "@/lib/utils";

export function useMetrics(filters: FilterParams) {
  const query = serializeFilters(filters);
  const key = `/api/metrics${query ? `?${query}` : ""}`;

  return useSWR<MetricsPayload>(key, fetchJson);
}
