import { notFound, redirect } from "next/navigation";
import { getMatchById, getMatchWithPlayers } from "@/repositories/matches";
import { getAllPlayers } from "@/repositories/players";
import { isAuthenticated } from "@/lib/auth";
import { EditMatchForm } from "./edit-match-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMatchDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export default async function EditMatchPage({ params }: Props) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/login");

  const { id } = await params;
  const matchId = parseInt(id);
  if (isNaN(matchId)) notFound();

  const [match, playerRows, allPlayers] = await Promise.all([
    getMatchById(matchId),
    getMatchWithPlayers(matchId),
    getAllPlayers(),
  ]);

  if (!match) notFound();

  const existingPlayers = playerRows.map((r) => r.match_players);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar partido</h1>
        <p className="text-muted-foreground mt-1">{formatMatchDate(match.playedAt)}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del partido</CardTitle>
        </CardHeader>
        <CardContent>
          <EditMatchForm match={match} players={allPlayers} existingPlayers={existingPlayers} />
        </CardContent>
      </Card>
    </div>
  );
}
