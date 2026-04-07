import { NextResponse } from "next/server";

import { getFilterOptions } from "@/lib/server/queries";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(getFilterOptions());
}
