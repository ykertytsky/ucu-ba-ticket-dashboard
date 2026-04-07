"use client";

import useSWR from "swr";

import type { FilterOptions } from "@/lib/types";
import { fetchJson } from "@/lib/utils";

export function useFilterOptions() {
  return useSWR<FilterOptions>("/api/filters", fetchJson);
}
