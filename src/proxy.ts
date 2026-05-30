import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/partidos/nuevo", "/jugadores/nuevo"];
const COOKIE_NAME = "admin_session";

export function proxy(request: NextRequest) {
  const isProtected = PROTECTED_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected) {
    const session = request.cookies.get(COOKIE_NAME)?.value;
    if (session !== "authenticated") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/partidos/nuevo", "/jugadores/nuevo"],
};
