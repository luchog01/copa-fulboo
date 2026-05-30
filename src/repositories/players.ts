import { db } from "@/db/client";
import { players, matchPlayers, matches } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { NewPlayer } from "@/db/schema";

export async function getAllPlayers() {
  return db.select().from(players).orderBy(players.name);
}

export async function getPlayerById(id: number) {
  const rows = await db.select().from(players).where(eq(players.id, id));
  return rows[0] ?? null;
}

export async function createPlayer(data: NewPlayer) {
  const rows = await db.insert(players).values(data).returning();
  return rows[0];
}

export async function getPlayersWithMatchData() {
  return db
    .select()
    .from(players)
    .leftJoin(matchPlayers, eq(players.id, matchPlayers.playerId))
    .leftJoin(matches, eq(matchPlayers.matchId, matches.id));
}
