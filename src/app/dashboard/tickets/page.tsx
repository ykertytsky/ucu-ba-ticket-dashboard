"use client";

import { GlobalFilterBar } from "@/components/filters/GlobalFilterBar";
import { PageHeader } from "@/components/layout/PageHeader";
import { TicketTable } from "@/components/tickets/TicketTable";
import { useFilters } from "@/hooks/useFilters";
import { useTickets } from "@/hooks/useTickets";

export default function TicketsPage() {
  const { filters, replaceFilters } = useFilters();
  const tickets = useTickets(filters);

  return (
    <>
      <PageHeader
        title="Тікети"
        description="Переглядайте окремі звернення за активний місяць, звужуйте вибірку фільтрами та відкривайте деталі без переходу в HESK."
        info="За замовчуванням сторінка відкриває найсвіжіший місяць із завантажених даних. Якщо потрібно, змініть діапазон дат у фільтрах."
      />
      <GlobalFilterBar />
      <TicketTable
        result={tickets.data}
        isLoading={tickets.isLoading}
        onPageChange={(page) => replaceFilters({ page })}
      />
    </>
  );
}
