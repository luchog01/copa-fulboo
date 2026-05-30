import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const ok = await login(password);
  if (!ok) return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
