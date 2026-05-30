"use client";

import { useActionState } from "react";
import { updatePlayerAction, deletePlayerAction, type ActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Player } from "@/db/schema";

export function EditPlayerForm({ player }: { player: Player }) {
  const boundAction = updatePlayerAction.bind(null, player.id);
  const [state, action, pending] = useActionState<ActionState, FormData>(boundAction, null);

  const deleteWithId = deletePlayerAction.bind(null, player.id);

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre completo</label>
          <Input type="text" name="name" defaultValue={player.name} required maxLength={100} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Apodo (opcional)</label>
          <Input type="text" name="nickname" defaultValue={player.nickname ?? ""} maxLength={50} />
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
              if (!confirm(`¿Eliminar a ${player.nickname ?? player.name}? Esta acción no se puede deshacer.`)) {
                e.preventDefault();
              }
            }}
          >
            Eliminar jugador
          </Button>
        </form>
      </div>
    </div>
  );
}
