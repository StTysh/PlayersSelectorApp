import type { Player, RoundPlayerResult } from "@/types";

/**
 * Apply round results to player scores and stats. Returns new player objects.
 */
export function applyRoundScores(
  players: Player[],
  results: RoundPlayerResult[],
  allowNegative: boolean
): Player[] {
  const adjustMap = new Map<string, RoundPlayerResult>();
  for (const r of results) {
    adjustMap.set(r.playerId, r);
  }

  return players.map((p) => {
    const result = adjustMap.get(p.id);
    if (!result) return p;

    let newScore = p.score + result.pointsAwarded;
    if (!allowNegative && newScore < 0) newScore = 0;

    const newStats = { ...p.stats, timesSelected: p.stats.timesSelected + 1 };
    if (result.status === "correct") {
      newStats.correctCount += 1;
    } else if (result.status === "wrong") {
      newStats.wrongCount += 1;
    } else if (result.status === "no-answer") {
      newStats.noAnswerCount += 1;
    }
    if (result.status === "first") newStats.firstCount = (newStats.firstCount || 0) + 1;
    if (result.status === "second") newStats.secondCount = (newStats.secondCount || 0) + 1;
    if (result.status === "third") newStats.thirdCount = (newStats.thirdCount || 0) + 1;
    if (result.status === "tie") newStats.tieCount = (newStats.tieCount || 0) + 1;

    return { ...p, score: newScore, stats: newStats, updatedAt: Date.now() };
  });
}

/**
 * Undo round results from player scores and stats. Returns new player objects.
 */
export function undoRoundScores(
  players: Player[],
  results: RoundPlayerResult[]
): Player[] {
  const adjustMap = new Map<string, RoundPlayerResult>();
  for (const r of results) {
    adjustMap.set(r.playerId, r);
  }

  return players.map((p) => {
    const result = adjustMap.get(p.id);
    if (!result) return p;

    const newScore = p.score - result.pointsAwarded;
    const newStats = {
      ...p.stats,
      timesSelected: Math.max(0, p.stats.timesSelected - 1),
    };
    if (result.status === "correct") {
      newStats.correctCount = Math.max(0, newStats.correctCount - 1);
    } else if (result.status === "wrong") {
      newStats.wrongCount = Math.max(0, newStats.wrongCount - 1);
    } else if (result.status === "no-answer") {
      newStats.noAnswerCount = Math.max(0, newStats.noAnswerCount - 1);
    }
    if (result.status === "first") newStats.firstCount = Math.max(0, (newStats.firstCount || 0) - 1);
    if (result.status === "second") newStats.secondCount = Math.max(0, (newStats.secondCount || 0) - 1);
    if (result.status === "third") newStats.thirdCount = Math.max(0, (newStats.thirdCount || 0) - 1);
    if (result.status === "tie") newStats.tieCount = Math.max(0, (newStats.tieCount || 0) - 1);

    return { ...p, score: newScore, stats: newStats, updatedAt: Date.now() };
  });
}

/**
 * Calculate accuracy percentage for a player.
 */
export function accuracyPercent(player: Player): number {
  const total = player.stats.correctCount + player.stats.wrongCount + player.stats.noAnswerCount;
  if (total === 0) return 0;
  return Math.round((player.stats.correctCount / total) * 100);
}
