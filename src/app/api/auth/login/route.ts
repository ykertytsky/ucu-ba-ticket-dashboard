import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getDashboardGateSecret } from "@/lib/gate";
import { HELP_DESK_GATE_COOKIE, signSessionToken, timingSafePasswordMatch } from "@/lib/gate-session";

export const runtime = "nodejs";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  const secret = getDashboardGateSecret();
  if (!secret) {
    return NextResponse.json({ error: "Перевірка доступу вимкнена." }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  const ok = await timingSafePasswordMatch(password, secret);
  if (!ok) {
    return NextResponse.json({ error: "Невірний пароль." }, { status: 401 });
  }

  const expiresAtMs = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const token = await signSessionToken(expiresAtMs, secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(HELP_DESK_GATE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });

  return res;
}
