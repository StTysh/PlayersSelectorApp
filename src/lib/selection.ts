import type { Player } from "@/types";
import { shuffleArray } from "./utils";

/**
 * Pure random selection from active players.
 */
export function selectRandomGroup(
  players: Player[],
  size: number
): Player[] {
  const active = players.filter((p) => p.isActive);
  if (size > active.length) return [...active];
  return shuffleArray(active).slice(0, size);
}

/**
 * Random selection that avoids choosing the exact same group as last time.
 * Falls back to pure random if impossible.
 */
export function selectAvoidRepeats(
  players: Player[],
  size: number,
  lastGroupIds: string[]
): Player[] {
  const active = players.filter((p) => p.isActive);
  if (size > active.length) return [...active];
  if (size >= active.length) return shuffleArray(active);

  // Try up to 20 times to find a different group
  for (let attempt = 0; attempt < 20; attempt++) {
    const group = shuffleArray(active).slice(0, size);
    const groupIds = new Set(group.map((p) => p.id));
    const lastSet = new Set(lastGroupIds);
    // Check if the group is different from last
    if (
      groupIds.size !== lastSet.size ||
      ![...groupIds].every((id) => lastSet.has(id))
    ) {
      return group;
    }
  }
  // Fallback: return any random selection
  return shuffleArray(active).slice(0, size);
}

/**
 * Fairness-biased selection: players with fewer selections are more likely
 * to be chosen. Uses weighted random sampling.
 */
export function selectFairness(
  players: Player[],
  size: number
): Player[] {
  const active = players.filter((p) => p.isActive);
  if (size > active.length) return [...active];
  if (size >= active.length) return shuffleArray(active);

  const maxSelected = Math.max(...active.map((p) => p.stats.timesSelected), 1);

  // Weight = (maxSelected + 1 - timesSelected). More weight = more likely.
  const weighted = active.map((p) => ({
    player: p,
    weight: maxSelected + 1 - p.stats.timesSelected,
  }));

  const selected: Player[] = [];
  const remaining = [...weighted];

  for (let i = 0; i < size; i++) {
    const totalWeight = remaining.reduce((s, w) => s + w.weight, 0);
    let rand = Math.random() * totalWeight;
    let chosenIdx = 0;
    for (let j = 0; j < remaining.length; j++) {
      rand -= remaining[j].weight;
      if (rand <= 0) {
        chosenIdx = j;
        break;
      }
    }
    selected.push(remaining[chosenIdx].player);
    remaining.splice(chosenIdx, 1);
  }

  return selected;
}

/**
 * Main selection function that dispatches to the right algorithm.
 */
export function selectGroup(
  players: Player[],
  size: number,
  mode: "random" | "avoid-repeats" | "fairness",
  lastGroupIds: string[] = []
): Player[] {
  switch (mode) {
    case "random":
      return selectRandomGroup(players, size);
    case "avoid-repeats":
      return selectAvoidRepeats(players, size, lastGroupIds);
    case "fairness":
      return selectFairness(players, size);
    default:
      return selectRandomGroup(players, size);
  }
}

/**
 * Check whether group selection is possible.
 */
export function canSelectGroup(
  players: Player[],
  size: number
): { possible: boolean; activeCount: number; reason?: string } {
  const activeCount = players.filter((p) => p.isActive).length;
  if (activeCount === 0) {
    return { possible: false, activeCount, reason: "No active players" };
  }
  if (size <= 0) {
    return { possible: false, activeCount, reason: "Group size must be at least 1" };
  }
  if (size > activeCount) {
    return {
      possible: false,
      activeCount,
      reason: `Group size (${size}) is larger than active players (${activeCount})`,
    };
  }
  return { possible: true, activeCount };
}
