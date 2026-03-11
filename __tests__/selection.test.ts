import {
  selectRandomGroup,
  selectAvoidRepeats,
  selectFairness,
  selectGroup,
  canSelectGroup,
} from "@/lib/selection";
import type { Player } from "@/types";

function makePlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Player ${i + 1}`,
    avatarPlaceholderType: "initials" as const,
    isActive: true,
    score: 0,
    stats: { timesSelected: 0, correctCount: 0, wrongCount: 0, noAnswerCount: 0 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));
}

describe("canSelectGroup", () => {
  it("returns false when no active players", () => {
    const result = canSelectGroup([], 3);
    expect(result.possible).toBe(false);
    expect(result.activeCount).toBe(0);
  });

  it("returns false when group size > active count", () => {
    const players = makePlayers(2);
    const result = canSelectGroup(players, 5);
    expect(result.possible).toBe(false);
  });

  it("returns false for groupSize 0", () => {
    const players = makePlayers(5);
    const result = canSelectGroup(players, 0);
    expect(result.possible).toBe(false);
  });

  it("returns true for valid group size", () => {
    const players = makePlayers(10);
    const result = canSelectGroup(players, 3);
    expect(result.possible).toBe(true);
    expect(result.activeCount).toBe(10);
  });

  it("ignores inactive players", () => {
    const players = makePlayers(5);
    players[0].isActive = false;
    players[1].isActive = false;
    const result = canSelectGroup(players, 4);
    expect(result.possible).toBe(false);
    expect(result.activeCount).toBe(3);
  });
});

describe("selectRandomGroup", () => {
  it("selects the correct number of players", () => {
    const players = makePlayers(10);
    const group = selectRandomGroup(players, 3);
    expect(group).toHaveLength(3);
  });

  it("returns no duplicates", () => {
    const players = makePlayers(10);
    for (let i = 0; i < 100; i++) {
      const group = selectRandomGroup(players, 5);
      const ids = group.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("only selects active players", () => {
    const players = makePlayers(10);
    players[0].isActive = false;
    players[1].isActive = false;
    for (let i = 0; i < 50; i++) {
      const group = selectRandomGroup(players, 3);
      group.forEach((p) => expect(p.isActive).toBe(true));
    }
  });

  it("returns all active if size > active count", () => {
    const players = makePlayers(3);
    const group = selectRandomGroup(players, 10);
    expect(group).toHaveLength(3);
  });
});

describe("selectAvoidRepeats", () => {
  it("avoids the same group as last time", () => {
    const players = makePlayers(10);
    const lastGroupIds = ["p1", "p2", "p3"];
    let different = false;
    for (let i = 0; i < 50; i++) {
      const group = selectAvoidRepeats(players, 3, lastGroupIds);
      const ids = new Set(group.map((p) => p.id));
      if (
        ids.size !== lastGroupIds.length ||
        !lastGroupIds.every((id) => ids.has(id))
      ) {
        different = true;
        break;
      }
    }
    expect(different).toBe(true);
  });

  it("works when the group is the entire active set (no avoidance possible)", () => {
    const players = makePlayers(3);
    const lastGroupIds = ["p1", "p2", "p3"];
    const group = selectAvoidRepeats(players, 3, lastGroupIds);
    expect(group).toHaveLength(3);
  });
});

describe("selectFairness", () => {
  it("biases toward less-selected players", () => {
    const players = makePlayers(6);
    // Players 1-3 have been selected 10 times, 4-6 zero times
    players[0].stats.timesSelected = 10;
    players[1].stats.timesSelected = 10;
    players[2].stats.timesSelected = 10;
    players[3].stats.timesSelected = 0;
    players[4].stats.timesSelected = 0;
    players[5].stats.timesSelected = 0;

    const counts: Record<string, number> = {};
    for (const p of players) counts[p.id] = 0;

    for (let i = 0; i < 1000; i++) {
      const group = selectFairness(players, 3);
      group.forEach((p) => counts[p.id]++);
    }

    // Under-selected players should be chosen more often
    const avgLow = (counts["p4"] + counts["p5"] + counts["p6"]) / 3;
    const avgHigh = (counts["p1"] + counts["p2"] + counts["p3"]) / 3;
    expect(avgLow).toBeGreaterThan(avgHigh);
  });

  it("returns unique members", () => {
    const players = makePlayers(10);
    for (let i = 0; i < 100; i++) {
      const group = selectFairness(players, 4);
      const ids = group.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("selectGroup dispatcher", () => {
  it("dispatches to random", () => {
    const players = makePlayers(10);
    const group = selectGroup(players, 3, "random");
    expect(group).toHaveLength(3);
  });

  it("dispatches to avoid-repeats", () => {
    const players = makePlayers(10);
    const group = selectGroup(players, 3, "avoid-repeats", ["p1", "p2", "p3"]);
    expect(group).toHaveLength(3);
  });

  it("dispatches to fairness", () => {
    const players = makePlayers(10);
    const group = selectGroup(players, 3, "fairness");
    expect(group).toHaveLength(3);
  });
});
