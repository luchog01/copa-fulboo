import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Match } from "@/db/schema";
import { formatMatchDate } from "@/lib/format";

type Props = { match: Match };

export function MatchCard({ match }: Props) {
  const homeWins = match.homeScore > match.awayScore;
  const draw = match.homeScore === match.awayScore;

  return (
    <Link href={`/partidos/${match.id}`} className="block group">
      <Card className="transition-all duration-150 group-hover:border-border/60 group-hover:shadow-sm">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs text-muted-foreground">{formatMatchDate(match.playedAt)}</span>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground w-10 text-right">Local</span>
                  <span className={`font-bold text-xl tabular-nums ${homeWins ? "text-green-500" : draw ? "text-foreground" : "text-muted-foreground"}`}>
                    {match.homeScore}
                  </span>
                </div>
                <span className="text-muted-foreground font-light">–</span>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-xl tabular-nums ${!homeWins && !draw ? "text-green-500" : draw ? "text-foreground" : "text-muted-foreground"}`}>
                    {match.awayScore}
                  </span>
                  <span className="text-xs text-muted-foreground w-14">Visitante</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {draw && <span className="text-xs text-muted-foreground">Empate</span>}
              <Badge variant="secondary" className="text-xs font-mono">{match.format}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
