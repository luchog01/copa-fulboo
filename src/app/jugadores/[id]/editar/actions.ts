"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { updatePlayer, deletePlayer } from "@/repositories/players";

const schema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  nickname: z.string().max(50).optional(),
});

export type ActionState = { error?: string } | null;

export async function updatePlayerAction(
  id: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const parsed = schema.safeParse({
    name: formData.get("name"),
    nickname: formData.get("nickname") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await updatePlayer(id, parsed.data);
  redirect("/jugadores");
}

export async function deletePlayerAction(id: number): Promise<never> {
  await requireAuth();
  await deletePlayer(id);
  redirect("/jugadores");
}
