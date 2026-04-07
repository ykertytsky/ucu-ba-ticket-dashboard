"use client";

import useSWR from "swr";

import { serializeFilters } from "@/lib/filters";
import type { FilterParams, TicketListResult } from "@/lib/types";
import { fetchJson } from "@/lib/utils";

export function useTickets(filters: FilterParams) {
  const query = serializeFilters(filters);
  const key = `/api/tickets${query ? `?${query}` : ""}`;

  return useSWR<TicketListResult>(key, fetchJson);
}
