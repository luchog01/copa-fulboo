"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createMatch } from "@/repositories/matches";

const matchSchema = z.object({
  playedAt: z.string().min(1, "Fecha requerida"),
  format: z.enum(["5v5", "8v8"]),
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
  notes: z.string().max(500).optional(),
  homePlayers: z.array(z.coerce.number().int()).min(1, "Seleccioná jugadores locales"),
  awayPlayers: z.array(z.coerce.number().int()).min(1, "Seleccioná jugadores visitantes"),
  mvpPlayerId: z.coerce.number().int().optional(),
});

export type ActionState = { error?: string } | null;

export async function createMatchAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();

  const raw = {
    playedAt: formData.get("playedAt"),
    format: formData.get("format"),
    homeScore: formData.get("homeScore"),
    awayScore: formData.get("awayScore"),
    notes: formData.get("notes") || undefined,
    homePlayers: formData.getAll("homePlayers"),
    awayPlayers: formData.getAll("awayPlayers"),
    mvpPlayerId: formData.get("mvpPlayerId") || undefined,
  };

  const parsed = matchSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { playedAt, format, homeScore, awayScore, notes, homePlayers, awayPlayers, mvpPlayerId } =
    parsed.data;

  const playerEntries = [
    ...homePlayers.map((id) => ({ playerId: id, team: "home" as const, isMvp: mvpPlayerId === id, matchId: 0 })),
    ...awayPlayers.map((id) => ({ playerId: id, team: "away" as const, isMvp: mvpPlayerId === id, matchId: 0 })),
  ];

  const match = await createMatch(
    { playedAt: new Date(playedAt), format, homeScore, awayScore, notes },
    playerEntries,
  );

  redirect(`/partidos/${match.id}`);
}
