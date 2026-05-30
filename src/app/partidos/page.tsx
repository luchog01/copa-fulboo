import { getAllMatches } from "@/repositories/matches";
import { MatchCard } from "@/components/match-card";
import { isAuthenticated } from "@/lib/auth";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function PartidosPage() {
  const [matches, authed] = await Promise.all([getAllMatches(), isAuthenticated()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Partidos</h1>
          <p className="text-muted-foreground mt-1">{matches.length} partidos registrados</p>
        </div>
        {authed && (
          <Link href="/partidos/nuevo" className={buttonVariants()}>+ Nuevo partido</Link>
        )}
      </div>

      {matches.length === 0 ? (
        <p className="text-muted-foreground">No hay partidos todavía.</p>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
