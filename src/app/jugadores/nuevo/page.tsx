import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { NewPlayerForm } from "./new-player-form";

export default async function NuevoJugadorPage() {
  const authed = await isAuthenticated();
  if (!authed) redirect("/login");

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo jugador</h1>
        <p className="text-muted-foreground mt-1">Agregá un jugador al roster</p>
      </div>
      <NewPlayerForm />
    </div>
  );
}
