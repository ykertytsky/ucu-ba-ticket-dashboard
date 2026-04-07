import { NextResponse } from "next/server";

import { listBatches } from "@/lib/server/queries";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ batches: listBatches() });
}
