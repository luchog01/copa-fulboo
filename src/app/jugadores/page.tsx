import { getAllPlayers, getPlayersWithMatchData } from "@/repositories/players";
import { computeAllStats, type PlayerStats } from "@/domain/stats";
import { isAuthenticated } from "@/lib/auth";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SortKey = "name" | "played" | "won" | "drawn" | "lost" | "mvps" | "winPct";
type SortDir = "asc" | "desc";

const VALID_SORT_KEYS = new Set<SortKey>(["name", "played", "won", "drawn", "lost", "mvps", "winPct"]);

// Default direction for each column: "best" values first
const DEFAULT_DIR: Record<SortKey, SortDir> = {
  name: "asc",
  played: "desc",
  won: "desc",
  drawn: "desc",
  lost: "asc",
  mvps: "desc",
  winPct: "desc",
};

function sortStats(stats: PlayerStats[], key: SortKey, dir: SortDir): PlayerStats[] {
  return [...stats].sort((a, b) => {
    let cmp: number;
    if (key === "name") {
      const nameA = a.player.nickname ?? a.player.name;
      const nameB = b.player.nickname ?? b.player.name;
      cmp = nameA.localeCompare(nameB, "es");
    } else {
      cmp = a[key] - b[key];
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

type SortHeaderProps = {
  col: SortKey;
  active: SortKey;
  dir: SortDir;
  children: React.ReactNode;
  align?: "left" | "center";
};

function SortHeader({ col, active, dir, children, align = "center" }: SortHeaderProps) {
  const isActive = active === col;
  const nextDir: SortDir = isActive
    ? dir === "desc" ? "asc" : "desc"
    : DEFAULT_DIR[col];
  const href = `/jugadores?sort=${col}&dir=${nextDir}`;

  return (
    <th className={`px-4 py-3 font-medium ${align === "left" ? "text-left" : "text-center"}`}>
      <Link
        href={href}
        className={`group inline-flex items-center gap-1 transition-colors cursor-pointer select-none ${
          align === "center" ? "justify-center w-full" : ""
        } ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      >
        <span className={isActive ? "font-semibold" : ""}>{children}</span>
        <span className="text-[10px] w-2.5 text-center leading-none">
          {isActive
            ? dir === "asc" ? "↑" : "↓"
            : <span className="opacity-0 group-hover:opacity-40 transition-opacity">↕</span>}
        </span>
      </Link>
    </th>
  );
}

type Props = { searchParams: Promise<{ sort?: string; dir?: string }> };

export default async function JugadoresPage({ searchParams }: Props) {
  const { sort, dir } = await searchParams;

  const sortKey: SortKey = VALID_SORT_KEYS.has(sort as SortKey) ? (sort as SortKey) : "winPct";
  const sortDir: SortDir = dir === "asc" || dir === "desc" ? dir : DEFAULT_DIR[sortKey];

  const [players, rawRows, authed] = await Promise.all([
    getAllPlayers(),
    getPlayersWithMatchData(),
    isAuthenticated(),
  ]);

  const matchPlayerRows = rawRows
    .filter((r) => r.match_players !== null && r.matches !== null)
    .map((r) => ({ ...r.match_players!, match: r.matches! }));

  const stats = sortStats(computeAllStats(players, matchPlayerRows), sortKey, sortDir);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jugadores</h1>
          <p className="text-muted-foreground mt-1">{players.length} jugadores en el grupo</p>
        </div>
        {authed && (
          <Link href="/jugadores/nuevo" className={buttonVariants()}>+ Jugador</Link>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium w-10">#</th>
                  <SortHeader col="name" active={sortKey} dir={sortDir} align="left">Jugador</SortHeader>
                  <SortHeader col="played" active={sortKey} dir={sortDir}>PJ</SortHeader>
                  <SortHeader col="won" active={sortKey} dir={sortDir}>G</SortHeader>
                  <SortHeader col="drawn" active={sortKey} dir={sortDir}>E</SortHeader>
                  <SortHeader col="lost" active={sortKey} dir={sortDir}>P</SortHeader>
                  <SortHeader col="mvps" active={sortKey} dir={sortDir}>MVP</SortHeader>
                  <SortHeader col="winPct" active={sortKey} dir={sortDir}>% Vic</SortHeader>
                </tr>
              </thead>
              <tbody>
                {stats.map((s, i) => (
                  <tr key={s.player.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{s.player.name}</span>
                      {s.player.nickname && (
                        <span className="text-muted-foreground ml-1 text-xs">({s.player.nickname})</span>
                      )}
                      {authed && (
                        <Link
                          href={`/jugadores/${s.player.id}/editar`}
                          className="ml-2 text-muted-foreground/40 hover:text-muted-foreground transition-colors text-xs"
                          title="Editar jugador"
                        >
                          ✎
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">{s.played}</td>
                    <td className="px-4 py-3 text-center text-green-500 font-medium">{s.won}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{s.drawn}</td>
                    <td className="px-4 py-3 text-center text-red-400">{s.lost}</td>
                    <td className="px-4 py-3 text-center text-yellow-500">
                      {s.mvps > 0 ? `★ ${s.mvps}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${s.winPct >= 50 ? "text-green-500" : "text-muted-foreground"}`}>
                        {s.winPct}%
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      No hay jugadores registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
