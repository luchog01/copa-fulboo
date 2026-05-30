import Link from "next/link";
import { getRecentMatches } from "@/repositories/matches";
import { getAllPlayers, getPlayersWithMatchData } from "@/repositories/players";
import { computeAllStats } from "@/domain/stats";
import { MatchCard } from "@/components/match-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Match, MatchPlayer } from "@/db/schema";

export default async function HomePage() {
  const [recentMatches, players, rawRows] = await Promise.all([
    getRecentMatches(5),
    getAllPlayers(),
    getPlayersWithMatchData(),
  ]);

  const matchPlayerRows = rawRows
    .filter((r) => r.match_players !== null && r.matches !== null)
    .map((r) => ({
      ...r.match_players!,
      match: r.matches!,
    }));

  const stats = computeAllStats(players, matchPlayerRows).slice(0, 5);

  return (
    <div className="space-y-10">
      <div className="text-center space-y-2 py-4">
        <h1 className="text-4xl font-bold tracking-tight">⚽ Copa Fulboo</h1>
        <p className="text-muted-foreground text-lg">El grupo de siempre, el fútbol de siempre</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Últimos partidos</h2>
            <Link href="/partidos" className="text-sm text-primary hover:underline">Ver todos →</Link>
          </div>
          <div className="space-y-3">
            {recentMatches.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay partidos registrados.</p>
            ) : (
              recentMatches.map((match) => <MatchCard key={match.id} match={match} />)
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Top jugadores</h2>
            <Link href="/jugadores" className="text-sm text-primary hover:underline">Ver tabla →</Link>
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">#</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Jugador</th>
                    <th className="text-center px-4 py-3 text-muted-foreground font-medium">PJ</th>
                    <th className="text-center px-4 py-3 text-muted-foreground font-medium">G</th>
                    <th className="text-center px-4 py-3 text-muted-foreground font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s, i) => (
                    <tr key={s.player.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">
                        {s.player.nickname ?? s.player.name}
                        {s.mvps > 0 && <span className="ml-1 text-yellow-500 text-xs">★{s.mvps}</span>}
                      </td>
                      <td className="px-4 py-3 text-center">{s.played}</td>
                      <td className="px-4 py-3 text-center text-green-500">{s.won}</td>
                      <td className="px-4 py-3 text-center">{s.winPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
