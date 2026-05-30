import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding database...");

  const playerNames = [
    { name: "Luciano", nickname: "Luci" },
    { name: "Matías", nickname: "Mati" },
    { name: "Federico", nickname: "Fede" },
    { name: "Santiago", nickname: "Santi" },
    { name: "Nicolás", nickname: "Nico" },
    { name: "Gonzalo", nickname: "Gonza" },
    { name: "Tomás", nickname: "Tomi" },
    { name: "Agustín", nickname: "Agus" },
    { name: "Rodrigo", nickname: "Rodri" },
    { name: "Ezequiel", nickname: "Eze" },
  ];

  const insertedPlayers = await db
    .insert(schema.players)
    .values(playerNames)
    .returning();

  console.log(`Inserted ${insertedPlayers.length} players`);

  const now = new Date();
  const matchData = [
    {
      playedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      format: "5v5" as const,
      homeScore: 4,
      awayScore: 2,
      notes: "Gran partido, muchos goles",
    },
    {
      playedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      format: "5v5" as const,
      homeScore: 1,
      awayScore: 1,
      notes: null,
    },
    {
      playedAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
      format: "8v8" as const,
      homeScore: 3,
      awayScore: 5,
      notes: "Partido de 8v8 especial",
    },
  ];

  const [m1, m2, m3] = await db
    .insert(schema.matches)
    .values(matchData)
    .returning();

  const ids = insertedPlayers.map((p) => p.id);

  await db.insert(schema.matchPlayers).values([
    // Match 1: home wins 4-2
    { matchId: m1.id, playerId: ids[0], team: "home", isMvp: true },
    { matchId: m1.id, playerId: ids[1], team: "home", isMvp: false },
    { matchId: m1.id, playerId: ids[2], team: "home", isMvp: false },
    { matchId: m1.id, playerId: ids[3], team: "home", isMvp: false },
    { matchId: m1.id, playerId: ids[4], team: "home", isMvp: false },
    { matchId: m1.id, playerId: ids[5], team: "away", isMvp: false },
    { matchId: m1.id, playerId: ids[6], team: "away", isMvp: false },
    { matchId: m1.id, playerId: ids[7], team: "away", isMvp: false },
    { matchId: m1.id, playerId: ids[8], team: "away", isMvp: false },
    { matchId: m1.id, playerId: ids[9], team: "away", isMvp: false },
    // Match 2: draw 1-1
    { matchId: m2.id, playerId: ids[0], team: "home", isMvp: false },
    { matchId: m2.id, playerId: ids[2], team: "home", isMvp: false },
    { matchId: m2.id, playerId: ids[4], team: "home", isMvp: false },
    { matchId: m2.id, playerId: ids[6], team: "home", isMvp: false },
    { matchId: m2.id, playerId: ids[8], team: "home", isMvp: false },
    { matchId: m2.id, playerId: ids[1], team: "away", isMvp: true },
    { matchId: m2.id, playerId: ids[3], team: "away", isMvp: false },
    { matchId: m2.id, playerId: ids[5], team: "away", isMvp: false },
    { matchId: m2.id, playerId: ids[7], team: "away", isMvp: false },
    { matchId: m2.id, playerId: ids[9], team: "away", isMvp: false },
    // Match 3: away wins 5-3 (8v8)
    { matchId: m3.id, playerId: ids[0], team: "home", isMvp: false },
    { matchId: m3.id, playerId: ids[1], team: "home", isMvp: false },
    { matchId: m3.id, playerId: ids[2], team: "home", isMvp: false },
    { matchId: m3.id, playerId: ids[3], team: "home", isMvp: false },
    { matchId: m3.id, playerId: ids[4], team: "home", isMvp: false },
    { matchId: m3.id, playerId: ids[5], team: "home", isMvp: false },
    { matchId: m3.id, playerId: ids[6], team: "home", isMvp: false },
    { matchId: m3.id, playerId: ids[7], team: "home", isMvp: false },
    { matchId: m3.id, playerId: ids[8], team: "away", isMvp: false },
    { matchId: m3.id, playerId: ids[9], team: "away", isMvp: true },
    { matchId: m3.id, playerId: ids[0], team: "away", isMvp: false },
    // extra players for 8v8 away
    { matchId: m3.id, playerId: ids[1], team: "away", isMvp: false },
    { matchId: m3.id, playerId: ids[2], team: "away", isMvp: false },
    { matchId: m3.id, playerId: ids[3], team: "away", isMvp: false },
    { matchId: m3.id, playerId: ids[4], team: "away", isMvp: false },
    { matchId: m3.id, playerId: ids[5], team: "away", isMvp: false },
  ]);

  console.log("Inserted 3 matches with players");
  console.log("Seed completed!");
  await client.end();
}

seed().catch(console.error);
