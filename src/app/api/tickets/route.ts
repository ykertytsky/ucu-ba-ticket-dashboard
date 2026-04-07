import { NextResponse } from "next/server";

import { parseFilterParams } from "@/lib/filters";
import { listTickets } from "@/lib/server/queries";

export const runtime = "nodejs";

export function GET(request: Request) {
  const url = new URL(request.url);
  const filters = parseFilterParams(url.searchParams);

  return NextResponse.json(listTickets(filters));
}
