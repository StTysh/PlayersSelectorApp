import type { Player } from "@/types";
import { generateId } from "./utils";

const SAMPLE_NAMES = [
  "Alex", "Jordan", "Sam", "Taylor", "Morgan",
  "Casey", "Riley", "Quinn", "Avery", "Charlie",
  "Jamie", "Drew", "Skyler", "Dakota", "Reese",
  "Finley", "Rowan", "Emery", "Sage", "River",
];

export function createDefaultPlayer(name: string): Player {
  const now = Date.now();
  return {
    id: generateId(),
    name,
    avatarPlaceholderType: "initials",
    isActive: true,
    score: 0,
    stats: {
      timesSelected: 0,
      correctCount: 0,
      wrongCount: 0,
      noAnswerCount: 0,
      firstCount: 0,
      secondCount: 0,
      thirdCount: 0,
      tieCount: 0,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function generateSeedPlayers(count = 10): Player[] {
  return SAMPLE_NAMES.slice(0, count).map((name) => createDefaultPlayer(name));
}
