"use client";

import useSWR from "swr";

import type { BatchRecord } from "@/lib/types";
import { fetchJson } from "@/lib/utils";

export function useBatches() {
  return useSWR<{ batches: BatchRecord[] }>("/api/batches", fetchJson);
}
