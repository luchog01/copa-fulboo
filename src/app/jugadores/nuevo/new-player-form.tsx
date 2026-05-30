"use client";

import { useActionState } from "react";
import { createPlayerAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewPlayerForm() {
  const [state, action, pending] = useActionState(createPlayerAction, null);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nombre completo</label>
        <Input type="text" name="name" placeholder="Ej: Lionel" required maxLength={100} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Apodo (opcional)</label>
        <Input type="text" name="nickname" placeholder="Ej: Leo" maxLength={50} />
      </div>
      {state?.error && <p className="text-destructive text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Guardando..." : "Agregar jugador"}
      </Button>
    </form>
  );
}
