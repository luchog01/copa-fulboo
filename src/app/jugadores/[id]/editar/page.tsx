import { notFound, redirect } from "next/navigation";
import { getPlayerById } from "@/repositories/players";
import { isAuthenticated } from "@/lib/auth";
import { EditPlayerForm } from "./edit-player-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { params: Promise<{ id: string }> };

export default async function EditPlayerPage({ params }: Props) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/login");

  const { id } = await params;
  const player = await getPlayerById(Number(id));
  if (!player) notFound();

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar jugador</h1>
        <p className="text-muted-foreground mt-1">{player.nickname ?? player.name}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del jugador</CardTitle>
        </CardHeader>
        <CardContent>
          <EditPlayerForm player={player} />
        </CardContent>
      </Card>
    </div>
  );
}
