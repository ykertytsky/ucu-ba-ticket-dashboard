import { NextResponse } from "next/server";

import { parseHeskXml } from "@/lib/parser/hesk-xml";
import { importBatch } from "@/lib/server/queries";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "XML-файл не знайдено у form-data." }, { status: 400 });
    }

    const text = await file.text();
    const parsed = parseHeskXml(text);
    const result = importBatch(file.name, parsed);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Не вдалося імпортувати XML-файл.",
      },
      { status: 500 },
    );
  }
}
