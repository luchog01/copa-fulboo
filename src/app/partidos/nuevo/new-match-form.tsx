"use client";

import { useActionState, useState } from "react";
import { createMatchAction } from "./actions";
import type { Player } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ComboboxRoot,
  ComboboxInputGroup,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxItem,
} from "@/components/ui/combobox";

type Props = { players: Player[] };

function playerLabel(p: Player) {
  return p.nickname ? `${p.name} (${p.nickname})` : p.name;
}

function PlayerCombobox({
  label,
  players,
  availablePlayers,
  selectedIds,
  onChangeIds,
}: {
  label: string;
  players: Player[];
  availablePlayers: Player[];
  selectedIds: number[];
  onChangeIds: (ids: number[]) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? availablePlayers.filter((p) =>
        playerLabel(p).toLowerCase().includes(query.toLowerCase())
      )
    : availablePlayers;

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium">
        {label} ({selectedIds.length})
      </span>
      <ComboboxRoot
        multiple
        value={selectedIds}
        onValueChange={(ids) => {
          onChangeIds(ids);
          setQuery("");
        }}
        onInputValueChange={(val) => setQuery(val)}
      >
        <ComboboxInputGroup>
          <ComboboxChips>
            {selectedIds.map((id) => {
              const p = players.find((pl) => pl.id === id)!;
              return (
                <ComboboxChip key={id}>
                  <span>{playerLabel(p)}</span>
                  <ComboboxChipRemove />
                </ComboboxChip>
              );
            })}
          </ComboboxChips>
          <ComboboxInput placeholder={`Buscar ${label.toLowerCase()}...`} />
          <ComboboxTrigger />
        </ComboboxInputGroup>
        <ComboboxContent>
          {filtered.map((p) => (
            <ComboboxItem key={p.id} value={p.id}>
              {playerLabel(p)}
            </ComboboxItem>
          ))}
          {filtered.length === 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Sin resultados
            </div>
          )}
        </ComboboxContent>
      </ComboboxRoot>
    </div>
  );
}

export function NewMatchForm({ players }: Props) {
  const [state, action, pending] = useActionState(createMatchAction, null);
  const [homePlayers, setHomePlayers] = useState<number[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<number[]>([]);
  const [mvpId, setMvpId] = useState<number | null>(null);

  const allSelected = [...homePlayers, ...awayPlayers];
  const availablePlayers = players.filter(
    (p) => !homePlayers.includes(p.id) && !awayPlayers.includes(p.id)
  );

  const now = new Date();
  const defaultDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
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
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="5v5">5 vs 5</option>
            <option value="8v8">8 vs 8</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="homeScore" className="text-sm font-medium">Goles Local</label>
          <Input id="homeScore" type="number" name="homeScore" min={0} defaultValue={0} required />
        </div>
        <div className="space-y-2">
          <label htmlFor="awayScore" className="text-sm font-medium">Goles Visitante</label>
          <Input id="awayScore" type="number" name="awayScore" min={0} defaultValue={0} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <PlayerCombobox
          label="Local"
          players={players}
          availablePlayers={availablePlayers}
          selectedIds={homePlayers}
          onChangeIds={setHomePlayers}
        />
        <PlayerCombobox
          label="Visitante"
          players={players}
          availablePlayers={availablePlayers}
          selectedIds={awayPlayers}
          onChangeIds={setAwayPlayers}
        />
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
                  {mvpId === p.id ? "★ " : ""}{playerLabel(p)}
                </button>
              ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Notas (opcional)</label>
        <Input type="text" name="notes" placeholder="Ej: Gran partido, muchos goles..." maxLength={500} />
      </div>

      {state?.error && <p className="text-destructive text-sm">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Guardando..." : "Guardar partido"}
      </Button>
    </form>
  );
}
