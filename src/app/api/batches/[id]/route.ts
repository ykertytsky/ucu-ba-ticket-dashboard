import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { gateUnauthorizedResponse } from "@/lib/gate";
import { deleteBatch } from "@/lib/server/queries";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const denied = await gateUnauthorizedResponse(request);
  if (denied) return denied;

  const { id } = await context.params;
  const deleted = deleteBatch(id);

  if (!deleted) {
    return NextResponse.json({ error: "Пакет не знайдено." }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
