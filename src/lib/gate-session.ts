const textEncoder = new TextEncoder();

export const HELP_DESK_GATE_COOKIE = "helpdesk_gate";

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(input));
  return bufferToHex(new Uint8Array(digest));
}

export async function signSessionToken(expiresAtMs: number, secret: string): Promise<string> {
  const payload = String(expiresAtMs);
  const sig = await hmacSha256Hex(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  const dot = token.indexOf(".");
  if (dot <= 0) return false;

  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Date.now()) return false;

  const expected = await hmacSha256Hex(secret, expStr);
  return timingSafeEqualHex(sig, expected);
}

export async function timingSafePasswordMatch(password: string, secret: string): Promise<boolean> {
  return timingSafeEqualHex(await sha256Hex(password), await sha256Hex(secret));
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign("HMAC", key, textEncoder.encode(message));
  return bufferToHex(new Uint8Array(buf));
}

function bufferToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i]!.toString(16).padStart(2, "0");
  }
  return out;
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
