"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useBatches } from "@/hooks/useBatches";
import {
  getCurrentMonthRange,
  getMonthRangeFromDateString,
  parseFilterParams,
  serializeFilters,
} from "@/lib/filters";
import type { FilterParams } from "@/lib/types";

const EMPTY_FILTERS = parseFilterParams({});

function dateOnlyFilters(filters: FilterParams): FilterParams {
  return {
    ...EMPTY_FILTERS,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    page: filters.page,
    limit: filters.limit,
  };
}

export function useFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: batchesData } = useBatches();
  const searchKey = searchParams.toString();
  const rawFilters = useMemo(
    () => parseFilterParams(new URLSearchParams(searchKey)),
    [searchKey],
  );
  const urlFilters = useMemo(() => dateOnlyFilters(rawFilters), [rawFilters]);
  const defaultMonthRange = useMemo(() => {
    const currentMonth = getCurrentMonthRange();
    const currentMonthKey = currentMonth.dateFrom.slice(0, 7);
    const hasCurrentMonthData = (batchesData?.batches ?? []).some(
      (batch) => batch.periodEnd.slice(0, 7) === currentMonthKey,
    );
    if (hasCurrentMonthData || !batchesData?.batches.length) {
      return currentMonth;
    }

    const latestBatch = batchesData?.batches[0];
    if (!latestBatch) {
      return currentMonth;
    }

    return getMonthRangeFromDateString(latestBatch.periodEnd) ?? currentMonth;
  }, [batchesData]);
  const filters = useMemo(() => {
    if (urlFilters.dateFrom || urlFilters.dateTo || !defaultMonthRange) {
      return urlFilters;
    }

    return {
      ...urlFilters,
      ...defaultMonthRange,
    };
  }, [defaultMonthRange, urlFilters]);

  useEffect(() => {
    const query = serializeFilters(filters);
    if (query === searchKey) {
      return;
    }

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [filters, pathname, router, searchKey]);

  function replaceFilters(nextFilters: Partial<FilterParams>) {
    const merged: FilterParams = {
      ...filters,
      ...nextFilters,
      page: nextFilters.page ?? 1,
    };
    const query = serializeFilters(merged);

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function resetFilters() {
    const query = defaultMonthRange
      ? serializeFilters({
          ...EMPTY_FILTERS,
          ...defaultMonthRange,
        })
      : "";

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return {
    defaultMonthRange,
    filters,
    replaceFilters,
    resetFilters,
  };
}
