import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getAllPlayers } from "@/repositories/players";
import { NewMatchForm } from "./new-match-form";

export default async function NuevoPartidoPage() {
  const authed = await isAuthenticated();
  if (!authed) redirect("/login");

  const players = await getAllPlayers();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo partido</h1>
        <p className="text-muted-foreground mt-1">Cargá el resultado de hoy</p>
      </div>
      <NewMatchForm players={players} />
    </div>
  );
}
