import { describe, it, expect } from "vitest";
import { computePlayerStats, computeAllStats } from "./stats";
import type { Player, Match, MatchPlayer } from "@/db/schema";

const makePlayer = (id: number, name: string): Player => ({
  id,
  name,
  nickname: null,
  createdAt: new Date(),
});

const makeMatch = (id: number, homeScore: number, awayScore: number): Match => ({
  id,
  playedAt: new Date(),
  format: "5v5",
  homeScore,
  awayScore,
  notes: null,
  createdAt: new Date(),
});

const makeRow = (
  matchPlayer: Omit<MatchPlayer, "id">,
  match: Match,
  id = 1,
) => ({ id, ...matchPlayer, match });

describe("computePlayerStats", () => {
  const player = makePlayer(1, "Luciano");

  it("computes win correctly", () => {
    const match = makeMatch(1, 3, 1);
    const rows = [makeRow({ matchId: 1, playerId: 1, team: "home", isMvp: false }, match)];
    const stats = computePlayerStats(player, rows);
    expect(stats.won).toBe(1);
    expect(stats.drawn).toBe(0);
    expect(stats.lost).toBe(0);
    expect(stats.played).toBe(1);
    expect(stats.winPct).toBe(100);
  });

  it("computes loss correctly for away team", () => {
    const match = makeMatch(1, 3, 1);
    const rows = [makeRow({ matchId: 1, playerId: 1, team: "away", isMvp: false }, match)];
    const stats = computePlayerStats(player, rows);
    expect(stats.lost).toBe(1);
    expect(stats.won).toBe(0);
    expect(stats.winPct).toBe(0);
  });

  it("computes draw correctly", () => {
    const match = makeMatch(1, 2, 2);
    const rows = [makeRow({ matchId: 1, playerId: 1, team: "home", isMvp: false }, match)];
    const stats = computePlayerStats(player, rows);
    expect(stats.drawn).toBe(1);
    expect(stats.won).toBe(0);
    expect(stats.lost).toBe(0);
    expect(stats.winPct).toBe(0);
  });

  it("counts MVP correctly", () => {
    const match = makeMatch(1, 2, 0);
    const rows = [makeRow({ matchId: 1, playerId: 1, team: "home", isMvp: true }, match)];
    const stats = computePlayerStats(player, rows);
    expect(stats.mvps).toBe(1);
  });

  it("handles multiple matches", () => {
    const m1 = makeMatch(1, 3, 0); // win home
    const m2 = makeMatch(2, 1, 1); // draw
    const m3 = makeMatch(3, 0, 2); // loss home
    const rows = [
      makeRow({ matchId: 1, playerId: 1, team: "home", isMvp: false }, m1, 1),
      makeRow({ matchId: 2, playerId: 1, team: "away", isMvp: false }, m2, 2),
      makeRow({ matchId: 3, playerId: 1, team: "home", isMvp: true }, m3, 3),
    ];
    const stats = computePlayerStats(player, rows);
    expect(stats.played).toBe(3);
    expect(stats.won).toBe(1);
    expect(stats.drawn).toBe(1);
    expect(stats.lost).toBe(1);
    expect(stats.mvps).toBe(1);
    expect(stats.winPct).toBe(33);
  });

  it("returns 0% winPct with no matches", () => {
    const stats = computePlayerStats(player, []);
    expect(stats.played).toBe(0);
    expect(stats.winPct).toBe(0);
  });
});

describe("computeAllStats", () => {
  it("sorts by won descending, using winPct as tiebreaker", () => {
    const p1 = makePlayer(1, "A");
    const p2 = makePlayer(2, "B");
    const m1 = makeMatch(1, 3, 0);
    const m2 = makeMatch(2, 3, 0);
    const m3 = makeMatch(3, 3, 0);
    const m4 = makeMatch(4, 0, 3);
    const rows = [
      // p1: 1 match, 1 win -> winPct 100
      makeRow({ matchId: 1, playerId: 1, team: "home", isMvp: false }, m1, 1),
      // p2: 3 matches, 2 wins, 1 loss -> winPct 67
      makeRow({ matchId: 2, playerId: 2, team: "home", isMvp: false }, m2, 2),
      makeRow({ matchId: 3, playerId: 2, team: "home", isMvp: false }, m3, 3),
      makeRow({ matchId: 4, playerId: 2, team: "home", isMvp: false }, m4, 4),
    ];
    const stats = computeAllStats([p1, p2], rows);
    expect(stats[0].player.id).toBe(2); // more wins (2) despite lower winPct
    expect(stats[1].player.id).toBe(1); // fewer wins (1) despite higher winPct
  });

  it("includes players with zero matches", () => {
    const p1 = makePlayer(1, "A");
    const stats = computeAllStats([p1], []);
    expect(stats).toHaveLength(1);
    expect(stats[0].played).toBe(0);
  });
});
