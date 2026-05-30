import { notFound } from "next/navigation";
import { getMatchById, getMatchWithPlayers } from "@/repositories/matches";
import { isAuthenticated } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { formatMatchDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params;
  const matchId = parseInt(id);
  if (isNaN(matchId)) notFound();

  const [match, playerRows, authed] = await Promise.all([
    getMatchById(matchId),
    getMatchWithPlayers(matchId),
    isAuthenticated(),
  ]);

  if (!match) notFound();

  const homePlayers = playerRows.filter((r) => r.match_players.team === "home");
  const awayPlayers = playerRows.filter((r) => r.match_players.team === "away");
  const mvp = playerRows.find((r) => r.match_players.isMvp);

  const homeWins = match.homeScore > match.awayScore;
  const draw = match.homeScore === match.awayScore;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {authed && (
        <div className="flex justify-end">
          <Link href={`/partidos/${matchId}/editar`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            Editar partido
          </Link>
        </div>
      )}

      {/* Scoreboard */}
      <div className="text-center space-y-3 py-4">
        <p className="text-sm text-muted-foreground">{formatMatchDate(match.playedAt)}</p>

        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground tracking-wide uppercase">Local</span>
            <span className={`text-7xl font-black tabular-nums leading-none ${homeWins ? "text-green-500" : draw ? "text-foreground" : "text-muted-foreground"}`}>
              {match.homeScore}
            </span>
          </div>
          <span className="text-4xl text-muted-foreground/40 font-thin mt-4">–</span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground tracking-wide uppercase">Visitante</span>
            <span className={`text-7xl font-black tabular-nums leading-none ${!homeWins && !draw ? "text-green-500" : draw ? "text-foreground" : "text-muted-foreground"}`}>
              {match.awayScore}
            </span>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 pt-1">
          <Badge variant="secondary" className="font-mono">{match.format}</Badge>
          {draw && <Badge variant="outline">Empate</Badge>}
        </div>

        {mvp?.players && (
          <p className="text-yellow-500 text-sm font-medium">
            ★ MVP — {mvp.players.nickname ?? mvp.players.name}
          </p>
        )}
        {match.notes && (
          <p className="text-muted-foreground text-sm italic max-w-sm mx-auto">"{match.notes}"</p>
        )}
      </div>

      {/* Teams */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={homeWins ? "border-green-800/50" : ""}>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1.5">
              Local
              {homeWins && <span className="text-green-500 text-xs">✓ Ganó</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ul className="space-y-1.5">
              {homePlayers.map((r) => (
                <li key={r.match_players.id} className="text-sm flex items-center gap-1.5">
                  <span>{r.players?.nickname ?? r.players?.name ?? "—"}</span>
                  {r.match_players.isMvp && <span className="text-yellow-500 text-xs">★</span>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className={!homeWins && !draw ? "border-green-800/50" : ""}>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1.5">
              Visitante
              {!homeWins && !draw && <span className="text-green-500 text-xs">✓ Ganó</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ul className="space-y-1.5">
              {awayPlayers.map((r) => (
                <li key={r.match_players.id} className="text-sm flex items-center gap-1.5">
                  <span>{r.players?.nickname ?? r.players?.name ?? "—"}</span>
                  {r.match_players.isMvp && <span className="text-yellow-500 text-xs">★</span>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
