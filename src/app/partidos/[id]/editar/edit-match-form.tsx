"use client";

import { useActionState, useState } from "react";
import { updateMatchAction, deleteMatchAction, type ActionState } from "./actions";
import type { Player, Match, MatchPlayer } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  match: Match;
  players: Player[];
  existingPlayers: MatchPlayer[];
};

function PlayerToggle({
  player,
  selected,
  disabled,
  onToggle,
}: {
  player: Player;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : disabled
          ? "border-border text-muted-foreground/30 cursor-not-allowed"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
      }`}
    >
      {player.nickname ?? player.name}
    </button>
  );
}

export function EditMatchForm({ match, players, existingPlayers }: Props) {
  const boundAction = updateMatchAction.bind(null, match.id);
  const [state, action, pending] = useActionState<ActionState, FormData>(boundAction, null);

  const [homePlayers, setHomePlayers] = useState<number[]>(
    existingPlayers.filter((p) => p.team === "home").map((p) => p.playerId),
  );
  const [awayPlayers, setAwayPlayers] = useState<number[]>(
    existingPlayers.filter((p) => p.team === "away").map((p) => p.playerId),
  );
  const [mvpId, setMvpId] = useState<number | null>(
    existingPlayers.find((p) => p.isMvp)?.playerId ?? null,
  );
  const [query, setQuery] = useState("");

  const allSelected = [...homePlayers, ...awayPlayers];

  const filteredPlayers = query.trim()
    ? players.filter((p) => {
        const q = query.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.nickname?.toLowerCase().includes(q) ?? false);
      })
    : players;

  function toggleHome(id: number) {
    if (awayPlayers.includes(id)) return;
    setHomePlayers((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function toggleAway(id: number) {
    if (homePlayers.includes(id)) return;
    setAwayPlayers((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  const localDate = new Date(match.playedAt);
  const pad = (n: number) => String(n).padStart(2, "0");
  const defaultDateTime = `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:${pad(localDate.getMinutes())}`;

  const deleteWithId = deleteMatchAction.bind(null, match.id);

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-6">
        {homePlayers.map((id) => (
          <input key={`h-${id}`} type="hidden" name="homePlayers" value={id} />
        ))}
        {awayPlayers.map((id) => (
          <input key={`a-${id}`} type="hidden" name="awayPlayers" value={id} />
        ))}
        {mvpId && <input type="hidden" name="mvpPlayerId" value={mvpId} />}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha y hora</label>
            <Input type="datetime-local" name="playedAt" defaultValue={defaultDateTime} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Formato</label>
            <select
              name="format"
              defaultValue={match.format}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="5v5">5 vs 5</option>
              <option value="8v8">8 vs 8</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Goles Local</label>
            <Input type="number" name="homeScore" min={0} defaultValue={match.homeScore} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Goles Visitante</label>
            <Input type="number" name="awayScore" min={0} defaultValue={match.awayScore} required />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Jugadores</span>
            <span className="text-xs text-muted-foreground">
              {homePlayers.length} local · {awayPlayers.length} visitante
            </span>
          </div>

          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <Input
              type="text"
              placeholder="Buscar jugador..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Local ({homePlayers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {filteredPlayers.map((p) => (
                    <PlayerToggle
                      key={p.id}
                      player={p}
                      selected={homePlayers.includes(p.id)}
                      disabled={awayPlayers.includes(p.id)}
                      onToggle={() => toggleHome(p.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Visitante ({awayPlayers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {filteredPlayers.map((p) => (
                    <PlayerToggle
                      key={p.id}
                      player={p}
                      selected={awayPlayers.includes(p.id)}
                      disabled={homePlayers.includes(p.id)}
                      onToggle={() => toggleAway(p.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {allSelected.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">MVP (opcional)</label>
            <div className="flex flex-wrap gap-2">
              {players
                .filter((p) => allSelected.includes(p.id))
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setMvpId((prev) => (prev === p.id ? null : p.id))}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      mvpId === p.id
                        ? "bg-yellow-500/20 text-yellow-500 border-yellow-500"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {mvpId === p.id ? "★ " : ""}{p.nickname ?? p.name}
                  </button>
                ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Notas (opcional)</label>
          <Input type="text" name="notes" defaultValue={match.notes ?? ""} maxLength={500} />
        </div>

        {state?.error && <p className="text-destructive text-sm">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>

      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground mb-3">Zona peligrosa</p>
        <form action={deleteWithId}>
          <Button
            type="submit"
            variant="destructive"
            className="w-full"
            onClick={(e) => {
              if (!confirm("¿Eliminar este partido? Esta acción no se puede deshacer.")) {
                e.preventDefault();
              }
            }}
          >
            Eliminar partido
          </Button>
        </form>
      </div>
    </div>
  );
}
