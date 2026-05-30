import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/partidos/nuevo", "/jugadores/nuevo"];
const COOKIE_NAME = "admin_session";
const SESSION_PAYLOAD = "authenticated";

async function verifySession(signed: string): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;

  const dot = signed.lastIndexOf(".");
  if (dot === -1) return false;

  const value = signed.slice(0, dot);
  const mac = signed.slice(dot + 1);

  // Use Web Crypto API (available in Edge Runtime)
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );

  const expectedBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );

  // base64url encode the expected MAC
  const expected = btoa(String.fromCharCode(...new Uint8Array(expectedBytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return value === SESSION_PAYLOAD && mac === expected;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected =
    PROTECTED_PATHS.some((p) => path.startsWith(p)) ||
    path.endsWith("/editar");

  if (isProtected) {
    const session = request.cookies.get(COOKIE_NAME)?.value;
    const valid = session ? await verifySession(session) : false;
    if (!valid) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/partidos/nuevo",
    "/jugadores/nuevo",
    "/partidos/:id/editar",
    "/jugadores/:id/editar",
  ],
};
