// ─── Player ───────────────────────────────────────────────

export interface PlayerStats {
  timesSelected: number;
  correctCount: number;
  wrongCount: number;
  noAnswerCount: number;
  firstCount: number;
  secondCount: number;
  thirdCount: number;
  tieCount: number;
}

export type AvatarPlaceholderType = "initials" | "male" | "female" | "neutral";

export interface Player {
  id: string;
  name: string;
  avatarImage?: string; // base64 data URL
  avatarPlaceholderType: AvatarPlaceholderType;
  isActive: boolean;
  score: number;
  stats: PlayerStats;
  createdAt: number;
  updatedAt: number;
}

// ─── Game Config ──────────────────────────────────────────

export type SelectionMode = "random" | "avoid-repeats" | "fairness";

export interface ScoringPreset {
  label: string;
  value: number;
}

export interface GameConfig {
  id: string;
  groupSize: number;
  selectionMode: SelectionMode;
  scoringPresets: ScoringPreset[];
  allowMultipleWinners: boolean;
  allowNegativePoints: boolean;
  showAnimations: boolean;
  presentationMode: boolean;
  enabledStatusTags: Record<string, boolean>;
}

// ─── Round ────────────────────────────────────────────────

export type PlayerRoundStatus =
  | "correct"
  | "wrong"
  | "no-answer"
  | "first"
  | "second"
  | "third"
  | "tie"
  | null;

export interface RoundPlayerResult {
  playerId: string;
  pointsAwarded: number;
  status: PlayerRoundStatus;
}

export interface Round {
  id: string;
  roundNumber: number;
  selectedPlayerIds: string[];
  results: RoundPlayerResult[];
  note: string;
  createdAt: number;
  finalizedAt: number | null;
}

// ─── History ──────────────────────────────────────────────

export type ActionType =
  | "round-finalized"
  | "round-undone"
  | "score-adjusted"
  | "player-added"
  | "player-removed"
  | "scores-reset"
  | "session-reset";

export interface HistoryEntry {
  id: string;
  roundId: string | null;
  actionType: ActionType;
  payload: Record<string, unknown>;
  timestamp: number;
}

// ─── UI State ─────────────────────────────────────────────

export type AppTab = "players" | "game" | "scoreboard" | "history";

export interface CurrentRoundState {
  selectedPlayerIds: string[];
  adjustments: Record<string, number>; // playerId -> point adjustment
  statuses: Record<string, PlayerRoundStatus>; // playerId -> status
  note: string;
  isLocked: boolean;
}
