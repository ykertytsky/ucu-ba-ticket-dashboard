"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { parseFilterParams, serializeFilters } from "@/lib/filters";
import type { FilterParams } from "@/lib/types";

export function useFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const filters = useMemo(
    () => parseFilterParams(new URLSearchParams(searchKey)),
    [searchKey],
  );

  function replaceFilters(nextFilters: Partial<FilterParams>) {
    const merged: FilterParams = {
      ...filters,
      ...nextFilters,
      page: nextFilters.page ?? 1,
    };
    const query = serializeFilters(merged);

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function removePill(key: string, value?: string) {
    if (key === "dateFrom" || key === "dateTo" || key === "search") {
      replaceFilters({ [key]: "" } as Partial<FilterParams>);
      return;
    }

    if (key === "category" || key === "priority" || key === "status" || key === "assignee") {
      const currentValues = filters[key];
      replaceFilters({
        [key]: currentValues.filter((item) => item !== value),
      } as Partial<FilterParams>);
    }
  }

  function resetFilters() {
    router.replace(pathname, { scroll: false });
  }

  return {
    filters,
    replaceFilters,
    removePill,
    resetFilters,
  };
}
