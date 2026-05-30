"use server";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";
const SESSION_PAYLOAD = "authenticated";

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET env var is not set");
  return s;
}

function sign(value: string): string {
  const mac = createHmac("sha256", getSecret()).update(value).digest("base64url");
  return `${value}.${mac}`;
}

function verify(signed: string): boolean {
  const dot = signed.lastIndexOf(".");
  if (dot === -1) return false;
  const value = signed.slice(0, dot);
  const mac = signed.slice(dot + 1);
  const expected = createHmac("sha256", getSecret()).update(value).digest("base64url");
  try {
    return timingSafeEqual(Buffer.from(mac), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const val = cookieStore.get(COOKIE_NAME)?.value;
  if (!val) return false;
  return verify(val);
}

export async function requireAuth(): Promise<void> {
  const authed = await isAuthenticated();
  if (!authed) {
    throw new Error("Unauthorized");
  }
}

export async function login(password: string): Promise<boolean> {
  if (password !== process.env.ADMIN_PASSWORD) return false;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sign(SESSION_PAYLOAD), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return true;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
