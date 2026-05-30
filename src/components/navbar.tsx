import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { LogoutButton } from "./logout-button";
import { ThemeToggle } from "./theme-toggle";

export async function Navbar() {
  const authed = await isAuthenticated();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-14">
        <Link href="/" className="font-semibold text-base tracking-tight flex items-center gap-2">
          <span className="text-lg">⚽</span>
          <span>Copa Fulboo</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/partidos"
            className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Partidos
          </Link>
          <Link
            href="/jugadores"
            className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Jugadores
          </Link>
          {authed ? (
            <>
              <Link
                href="/partidos/nuevo"
                className="px-3 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                + Partido
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Admin
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
