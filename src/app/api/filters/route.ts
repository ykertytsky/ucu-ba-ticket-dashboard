import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { gateUnauthorizedResponse } from "@/lib/gate";
import { getFilterOptions } from "@/lib/server/queries";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const denied = await gateUnauthorizedResponse(request);
  if (denied) return denied;

  return NextResponse.json(getFilterOptions());
}
