import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { parseFilterParams } from "@/lib/filters";
import { gateUnauthorizedResponse } from "@/lib/gate";
import { listTickets } from "@/lib/server/queries";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const denied = await gateUnauthorizedResponse(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const filters = parseFilterParams(url.searchParams);

  return NextResponse.json(listTickets(filters));
}
