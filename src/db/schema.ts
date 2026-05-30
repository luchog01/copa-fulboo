import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const matchFormatEnum = pgEnum("match_format", ["5v5", "8v8"]);
export const teamEnum = pgEnum("team_side", ["home", "away"]);

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nickname: varchar("nickname", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  playedAt: timestamp("played_at").notNull(),
  format: matchFormatEnum("format").notNull().default("5v5"),
  homeScore: integer("home_score").notNull(),
  awayScore: integer("away_score").notNull(),
  notes: varchar("notes", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matchPlayers = pgTable("match_players", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  team: teamEnum("team").notNull(),
  isMvp: boolean("is_mvp").notNull().default(false),
});

export const playersRelations = relations(players, ({ many }) => ({
  matchPlayers: many(matchPlayers),
}));

export const matchesRelations = relations(matches, ({ many }) => ({
  matchPlayers: many(matchPlayers),
}));

export const matchPlayersRelations = relations(matchPlayers, ({ one }) => ({
  match: one(matches, { fields: [matchPlayers.matchId], references: [matches.id] }),
  player: one(players, { fields: [matchPlayers.playerId], references: [players.id] }),
}));

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type MatchPlayer = typeof matchPlayers.$inferSelect;
export type NewMatchPlayer = typeof matchPlayers.$inferInsert;
