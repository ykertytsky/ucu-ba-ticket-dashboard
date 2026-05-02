import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { HELP_DESK_GATE_COOKIE, verifySessionToken } from "@/lib/gate-session";

export function getDashboardGateSecret(): string | undefined {
  const raw = process.env.DASHBOARD_GATE_SECRET;
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function gateUnauthorizedResponse(
  request: NextRequest,
): Promise<NextResponse | null> {
  const secret = getDashboardGateSecret();
  if (!secret) return null;

  const token = request.cookies.get(HELP_DESK_GATE_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token, secret))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
