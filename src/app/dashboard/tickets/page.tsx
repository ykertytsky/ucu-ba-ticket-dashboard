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
        description="Пошук конкретних звернень і робота з деталями. Тут можна звузити вибірку за періодом, категоріями, статусами, виконавцями й текстом звернення."
        info="Для швидкого аналізу відкрийте лише активні тікети, а потім перегляньте деталі в бічній панелі."
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
