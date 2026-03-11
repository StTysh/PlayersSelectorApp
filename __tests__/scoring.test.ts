import { applyRoundScores, undoRoundScores, accuracyPercent } from "@/lib/scoring";
import type { Player, RoundPlayerResult } from "@/types";

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "p1",
    name: "Test Player",
    avatarPlaceholderType: "initials",
    isActive: true,
    score: 0,
    stats: { timesSelected: 0, correctCount: 0, wrongCount: 0, noAnswerCount: 0 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("applyRoundScores", () => {
  it("adds positive points", () => {
    const players = [makePlayer({ id: "p1", score: 5 })];
    const results: RoundPlayerResult[] = [
      { playerId: "p1", pointsAwarded: 2, status: "correct" },
    ];
    const updated = applyRoundScores(players, results, true);
    expect(updated[0].score).toBe(7);
    expect(updated[0].stats.correctCount).toBe(1);
    expect(updated[0].stats.timesSelected).toBe(1);
  });

  it("subtracts points when allowed", () => {
    const players = [makePlayer({ id: "p1", score: 3 })];
    const results: RoundPlayerResult[] = [
      { playerId: "p1", pointsAwarded: -5, status: "wrong" },
    ];
    const updated = applyRoundScores(players, results, true);
    expect(updated[0].score).toBe(-2);
    expect(updated[0].stats.wrongCount).toBe(1);
  });

  it("clamps to zero when negative not allowed", () => {
    const players = [makePlayer({ id: "p1", score: 2 })];
    const results: RoundPlayerResult[] = [
      { playerId: "p1", pointsAwarded: -5, status: "wrong" },
    ];
    const updated = applyRoundScores(players, results, false);
    expect(updated[0].score).toBe(0);
  });

  it("handles multiple players", () => {
    const players = [
      makePlayer({ id: "p1", score: 0 }),
      makePlayer({ id: "p2", score: 3 }),
      makePlayer({ id: "p3", score: 1 }),
    ];
    const results: RoundPlayerResult[] = [
      { playerId: "p1", pointsAwarded: 1, status: "correct" },
      { playerId: "p2", pointsAwarded: 0, status: "no-answer" },
    ];
    const updated = applyRoundScores(players, results, true);
    expect(updated[0].score).toBe(1);
    expect(updated[1].score).toBe(3);
    expect(updated[1].stats.noAnswerCount).toBe(1);
    expect(updated[2].score).toBe(1); // unchanged
  });

  it("counts first/second/third as rank tags, not correctCount", () => {
    const players = [
      makePlayer({ id: "p1" }),
      makePlayer({ id: "p2" }),
    ];
    const results: RoundPlayerResult[] = [
      { playerId: "p1", pointsAwarded: 2, status: "first" },
      { playerId: "p2", pointsAwarded: 1, status: "second" },
    ];
    const updated = applyRoundScores(players, results, true);
    expect(updated[0].stats.correctCount).toBe(0);
    expect(updated[1].stats.correctCount).toBe(0);
    expect(updated[0].stats.firstCount).toBe(1);
    expect(updated[1].stats.secondCount).toBe(1);
  });
});

describe("undoRoundScores", () => {
  it("reverses score changes", () => {
    const players = [makePlayer({ id: "p1", score: 7, stats: { timesSelected: 3, correctCount: 2, wrongCount: 0, noAnswerCount: 0 } })];
    const results: RoundPlayerResult[] = [
      { playerId: "p1", pointsAwarded: 2, status: "correct" },
    ];
    const undone = undoRoundScores(players, results);
    expect(undone[0].score).toBe(5);
    expect(undone[0].stats.correctCount).toBe(1);
    expect(undone[0].stats.timesSelected).toBe(2);
  });

  it("does not go below zero for stats", () => {
    const players = [makePlayer({ id: "p1", score: 1, stats: { timesSelected: 0, correctCount: 0, wrongCount: 0, noAnswerCount: 0 } })];
    const results: RoundPlayerResult[] = [
      { playerId: "p1", pointsAwarded: 1, status: "correct" },
    ];
    const undone = undoRoundScores(players, results);
    expect(undone[0].stats.timesSelected).toBe(0);
    expect(undone[0].stats.correctCount).toBe(0);
  });
});

describe("accuracyPercent", () => {
  it("returns 0 when no attempts", () => {
    const player = makePlayer();
    expect(accuracyPercent(player)).toBe(0);
  });

  it("calculates correctly", () => {
    const player = makePlayer({
      stats: { timesSelected: 10, correctCount: 7, wrongCount: 2, noAnswerCount: 1 },
    });
    expect(accuracyPercent(player)).toBe(70);
  });

  it("handles all correct", () => {
    const player = makePlayer({
      stats: { timesSelected: 5, correctCount: 5, wrongCount: 0, noAnswerCount: 0 },
    });
    expect(accuracyPercent(player)).toBe(100);
  });
});
