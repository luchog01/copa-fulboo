"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createPlayer } from "@/repositories/players";

const playerSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  nickname: z.string().max(50).optional(),
});

export type ActionState = { error?: string } | null;

export async function createPlayerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const parsed = playerSchema.safeParse({
    name: formData.get("name"),
    nickname: formData.get("nickname") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await createPlayer(parsed.data);
  redirect("/jugadores");
}
