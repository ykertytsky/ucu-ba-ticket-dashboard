import { NextResponse } from "next/server";

import { deleteBatch } from "@/lib/server/queries";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const deleted = deleteBatch(id);

  if (!deleted) {
    return NextResponse.json({ error: "Пакет не знайдено." }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
