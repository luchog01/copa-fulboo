import { db } from "@/db/client";
import { matches, matchPlayers, players } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { NewMatch, NewMatchPlayer } from "@/db/schema";

export async function getAllMatches() {
  return db.select().from(matches).orderBy(desc(matches.playedAt));
}

export async function getMatchById(id: number) {
  const rows = await db.select().from(matches).where(eq(matches.id, id));
  return rows[0] ?? null;
}

export async function getMatchWithPlayers(matchId: number) {
  return db
    .select()
    .from(matchPlayers)
    .where(eq(matchPlayers.matchId, matchId))
    .leftJoin(players, eq(matchPlayers.playerId, players.id));
}

export async function getRecentMatches(limit = 5) {
  return db.select().from(matches).orderBy(desc(matches.playedAt)).limit(limit);
}

export async function getAllMatchPlayersWithMatch() {
  return db
    .select()
    .from(matchPlayers)
    .leftJoin(matches, eq(matchPlayers.matchId, matches.id));
}

export async function createMatch(
  matchData: NewMatch,
  playerEntries: NewMatchPlayer[],
) {
  return db.transaction(async (tx) => {
    const [match] = await tx.insert(matches).values(matchData).returning();
    const entries = playerEntries.map((e) => ({ ...e, matchId: match.id }));
    await tx.insert(matchPlayers).values(entries);
    return match;
  });
}
