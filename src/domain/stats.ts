import type { Match, MatchPlayer, Player } from "@/db/schema";

export type PlayerMatchRow = MatchPlayer & { match: Match };

export type PlayerStats = {
  player: Player;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  mvps: number;
  winPct: number;
};

function matchResult(team: "home" | "away", homeScore: number, awayScore: number): "won" | "drawn" | "lost" {
  if (homeScore === awayScore) return "drawn";
  if (team === "home") return homeScore > awayScore ? "won" : "lost";
  return awayScore > homeScore ? "won" : "lost";
}

export function computePlayerStats(player: Player, rows: PlayerMatchRow[]): PlayerStats {
  let won = 0, drawn = 0, lost = 0, mvps = 0;

  for (const row of rows) {
    const result = matchResult(row.team, row.match.homeScore, row.match.awayScore);
    if (result === "won") won++;
    else if (result === "drawn") drawn++;
    else lost++;
    if (row.isMvp) mvps++;
  }

  const played = rows.length;
  const winPct = played > 0 ? Math.round((won / played) * 100) : 0;

  return { player, played, won, drawn, lost, mvps, winPct };
}

export function computeAllStats(
  players: Player[],
  matchPlayerRows: (MatchPlayer & { match: Match })[],
): PlayerStats[] {
  return players
    .map((player) => {
      const rows = matchPlayerRows.filter((r) => r.playerId === player.id);
      return computePlayerStats(player, rows);
    })
    .sort((a, b) => b.won - a.won || b.winPct - a.winPct);
}
