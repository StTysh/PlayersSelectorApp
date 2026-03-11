import { create } from "zustand";
import type {
  Player,
  GameConfig,
  Round,
  HistoryEntry,
  AppTab,
  CurrentRoundState,
  RoundPlayerResult,
  PlayerRoundStatus,
  ScoringPreset,
  SelectionMode,
  AvatarPlaceholderType,
} from "@/types";
import { generateId } from "./utils";
import { selectGroup, canSelectGroup } from "./selection";
import { applyRoundScores, undoRoundScores } from "./scoring";
import { createDefaultPlayer } from "./seed-data";

// ─── Default Config ───────────────────────────────────────

const DEFAULT_CONFIG: GameConfig = {
  id: "default",
  groupSize: 0,
  selectionMode: "fairness",
  scoringPresets: [
    { label: "+1", value: 1 },
    { label: "-1", value: -1 },
    { label: "+2", value: 2 },
  ],
  allowMultipleWinners: true,
  allowNegativePoints: false,
  showAnimations: true,
  presentationMode: false,
  enabledStatusTags: {
    correct: true,
    wrong: true,
    "no-answer": true,
    first: true,
    second: true,
    third: true,
    tie: true,
  },
};

// ─── Store Types ──────────────────────────────────────────

interface AppState {
  // Data
  players: Player[];
  config: GameConfig;
  rounds: Round[];
  historyLog: HistoryEntry[];

  // UI
  activeTab: AppTab;
  currentRound: CurrentRoundState | null;
  isModalOpen: boolean;
  isLoaded: boolean;
  showEndGame: boolean;
  showPresentation: boolean;
  showScoreSidebar: boolean;
  showStats: boolean;

  // Player actions
  addPlayer: (name: string, avatarImage?: string, avatarPlaceholderType?: AvatarPlaceholderType) => void;
  addPlayers: (names: string[]) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  togglePlayerActive: (id: string) => void;
  importPlayers: (players: Partial<Player>[]) => void;
  setPlayers: (players: Player[]) => void;

  // Config actions
  updateConfig: (updates: Partial<GameConfig>) => void;
  setGroupSize: (size: number) => void;
  setSelectionMode: (mode: SelectionMode) => void;
  setScoringPresets: (presets: ScoringPreset[]) => void;

  // Game actions
  chooseGroup: () => void;
  rerollGroup: () => void;
  lockSelection: () => void;
  swapPlayer: (outId: string, inId: string) => void;
  addPlayerToRound: (playerId: string) => void;
  removePlayerFromRound: (playerId: string) => void;
  setPlayerAdjustment: (playerId: string, points: number) => void;
  adjustPlayerPoints: (playerId: string, delta: number) => void;
  setPlayerStatus: (playerId: string, status: PlayerRoundStatus) => void;
  setRoundNote: (note: string) => void;
  finalizeRound: () => void;
  discardRound: () => void;
  undoLastRound: () => void;
  closeModal: () => void;

  // Score actions
  resetAllScores: () => void;
  resetSession: () => void;

  // UI actions
  setActiveTab: (tab: AppTab) => void;
  setShowEndGame: (show: boolean) => void;
  setShowPresentation: (show: boolean) => void;
  toggleScoreSidebar: () => void;
  setShowStats: (show: boolean) => void;

  // Persistence
  hydrate: (data: {
    players: Player[];
    config: GameConfig;
    rounds: Round[];
    historyLog: HistoryEntry[];
  }) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // ─── Initial State ────────────────────────────────────
  players: [],
  config: DEFAULT_CONFIG,
  rounds: [],
  historyLog: [],
  activeTab: "game",
  currentRound: null,
  isModalOpen: false,
  isLoaded: false,
  showEndGame: false,
  showPresentation: false,
  showScoreSidebar: false,
  showStats: false,

  // ─── Player Actions ───────────────────────────────────
  addPlayer: (name, avatarImage, avatarPlaceholderType) => {
    const player = createDefaultPlayer(name.trim());
    if (avatarImage) player.avatarImage = avatarImage;
    if (avatarPlaceholderType) player.avatarPlaceholderType = avatarPlaceholderType;
    set((s) => ({ players: [...s.players, player] }));
  },

  addPlayers: (names) => {
    const newPlayers = names
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => createDefaultPlayer(n));
    set((s) => ({ players: [...s.players, ...newPlayers] }));
  },

  updatePlayer: (id, updates) => {
    set((s) => ({
      players: s.players.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
      ),
    }));
  },

  removePlayer: (id) => {
    set((s) => ({ players: s.players.filter((p) => p.id !== id) }));
  },

  togglePlayerActive: (id) => {
    set((s) => ({
      players: s.players.map((p) =>
        p.id === id ? { ...p, isActive: !p.isActive, updatedAt: Date.now() } : p
      ),
    }));
  },

  importPlayers: (partials) => {
    const newPlayers = partials.map((p) => {
      const player = createDefaultPlayer(p.name || "Unnamed");
      if (p.avatarImage) player.avatarImage = p.avatarImage;
      if (p.avatarPlaceholderType) player.avatarPlaceholderType = p.avatarPlaceholderType;
      if (p.isActive !== undefined) player.isActive = p.isActive;
      if (typeof p.score === "number") player.score = p.score;
      if (p.stats) player.stats = { ...player.stats, ...p.stats };
      return player;
    });
    set((s) => ({ players: [...s.players, ...newPlayers] }));
  },

  setPlayers: (players) => set({ players }),

  // ─── Config Actions ───────────────────────────────────
  updateConfig: (updates) => {
    set((s) => ({ config: { ...s.config, ...updates } }));
  },

  setGroupSize: (size) => {
    set((s) => ({ config: { ...s.config, groupSize: size } }));
  },

  setSelectionMode: (mode) => {
    set((s) => ({ config: { ...s.config, selectionMode: mode } }));
  },

  setScoringPresets: (presets) => {
    set((s) => ({ config: { ...s.config, scoringPresets: presets } }));
  },

  // ─── Game Actions ─────────────────────────────────────
  chooseGroup: () => {
    const { players, config, rounds } = get();
    const check = canSelectGroup(players, config.groupSize);
    if (!check.possible) return;

    const lastGroupIds =
      rounds.length > 0 ? rounds[rounds.length - 1].selectedPlayerIds : [];

    const group = selectGroup(
      players,
      config.groupSize,
      config.selectionMode,
      lastGroupIds
    );

    const adjustments: Record<string, number> = {};
    const statuses: Record<string, PlayerRoundStatus> = {};
    group.forEach((p) => {
      adjustments[p.id] = 0;
      statuses[p.id] = null;
    });

    set({
      currentRound: {
        selectedPlayerIds: group.map((p) => p.id),
        adjustments,
        statuses,
        note: "",
        isLocked: false,
      },
      isModalOpen: true,
    });
  },

  rerollGroup: () => {
    const { currentRound } = get();
    if (currentRound?.isLocked) return;
    get().chooseGroup();
  },

  lockSelection: () => {
    set((s) => {
      if (!s.currentRound) return s;
      return {
        currentRound: { ...s.currentRound, isLocked: !s.currentRound.isLocked },
      };
    });
  },

  swapPlayer: (outId, inId) => {
    set((s) => {
      if (!s.currentRound || s.currentRound.isLocked) return s;
      const ids = s.currentRound.selectedPlayerIds.map((id) =>
        id === outId ? inId : id
      );
      const adjustments = { ...s.currentRound.adjustments };
      const statuses = { ...s.currentRound.statuses };
      delete adjustments[outId];
      delete statuses[outId];
      adjustments[inId] = 0;
      statuses[inId] = null;
      return {
        currentRound: { ...s.currentRound, selectedPlayerIds: ids, adjustments, statuses },
      };
    });
  },

  addPlayerToRound: (playerId) => {
    set((s) => {
      if (!s.currentRound) return s;
      if (s.currentRound.selectedPlayerIds.includes(playerId)) return s;
      return {
        currentRound: {
          ...s.currentRound,
          selectedPlayerIds: [...s.currentRound.selectedPlayerIds, playerId],
          adjustments: { ...s.currentRound.adjustments, [playerId]: 0 },
          statuses: { ...s.currentRound.statuses, [playerId]: null },
        },
      };
    });
  },

  removePlayerFromRound: (playerId) => {
    set((s) => {
      if (!s.currentRound) return s;
      const adjustments = { ...s.currentRound.adjustments };
      const statuses = { ...s.currentRound.statuses };
      delete adjustments[playerId];
      delete statuses[playerId];
      return {
        currentRound: {
          ...s.currentRound,
          selectedPlayerIds: s.currentRound.selectedPlayerIds.filter(
            (id) => id !== playerId
          ),
          adjustments,
          statuses,
        },
      };
    });
  },

  setPlayerAdjustment: (playerId, points) => {
    set((s) => {
      if (!s.currentRound) return s;
      return {
        currentRound: {
          ...s.currentRound,
          adjustments: { ...s.currentRound.adjustments, [playerId]: points },
        },
      };
    });
  },

  adjustPlayerPoints: (playerId, delta) => {
    set((s) => {
      if (!s.currentRound) return s;
      const current = s.currentRound.adjustments[playerId] || 0;
      const newVal = current + delta;
      if (!s.config.allowNegativePoints && newVal < 0) return s;
      return {
        currentRound: {
          ...s.currentRound,
          adjustments: { ...s.currentRound.adjustments, [playerId]: newVal },
        },
      };
    });
  },

  setPlayerStatus: (playerId, status) => {
    set((s) => {
      if (!s.currentRound) return s;
      const currentStatus = s.currentRound.statuses[playerId];
      return {
        currentRound: {
          ...s.currentRound,
          statuses: {
            ...s.currentRound.statuses,
            [playerId]: currentStatus === status ? null : status,
          },
        },
      };
    });
  },

  setRoundNote: (note) => {
    set((s) => {
      if (!s.currentRound) return s;
      return { currentRound: { ...s.currentRound, note } };
    });
  },

  finalizeRound: () => {
    const { currentRound, players, rounds, config } = get();
    if (!currentRound) return;

    const roundNumber = rounds.length + 1;
    const results: RoundPlayerResult[] = currentRound.selectedPlayerIds.map(
      (pid) => ({
        playerId: pid,
        pointsAwarded: currentRound.adjustments[pid] || 0,
        status: currentRound.statuses[pid] || null,
      })
    );

    const updatedPlayers = applyRoundScores(
      players,
      results,
      config.allowNegativePoints
    );

    // Record actual points applied (may differ from intended due to clamping)
    const actualResults = results.map((r) => {
      const before = players.find((p) => p.id === r.playerId);
      const after = updatedPlayers.find((p) => p.id === r.playerId);
      if (before && after) {
        return { ...r, pointsAwarded: after.score - before.score };
      }
      return r;
    });

    const round: Round = {
      id: generateId(),
      roundNumber,
      selectedPlayerIds: currentRound.selectedPlayerIds,
      results: actualResults,
      note: currentRound.note,
      createdAt: Date.now(),
      finalizedAt: Date.now(),
    };

    const historyEntry: HistoryEntry = {
      id: generateId(),
      roundId: round.id,
      actionType: "round-finalized",
      payload: { roundNumber, results: actualResults },
      timestamp: Date.now(),
    };

    set({
      players: updatedPlayers,
      rounds: [...rounds, round],
      historyLog: [...get().historyLog, historyEntry],
      currentRound: null,
      isModalOpen: false,
    });
  },

  discardRound: () => {
    set({ currentRound: null, isModalOpen: false });
  },

  undoLastRound: () => {
    const { rounds, players, historyLog } = get();
    if (rounds.length === 0) return;

    const lastRound = rounds[rounds.length - 1];
    const restoredPlayers = undoRoundScores(players, lastRound.results);

    const historyEntry: HistoryEntry = {
      id: generateId(),
      roundId: lastRound.id,
      actionType: "round-undone",
      payload: { roundNumber: lastRound.roundNumber },
      timestamp: Date.now(),
    };

    set({
      players: restoredPlayers,
      rounds: rounds.slice(0, -1),
      historyLog: [...historyLog, historyEntry],
    });
  },

  closeModal: () => {
    set({ isModalOpen: false, currentRound: null });
  },

  // ─── Score Actions ────────────────────────────────────
  resetAllScores: () => {
    set((s) => ({
      players: s.players.map((p) => ({
        ...p,
        score: 0,
        stats: { timesSelected: 0, correctCount: 0, wrongCount: 0, noAnswerCount: 0, firstCount: 0, secondCount: 0, thirdCount: 0, tieCount: 0 },
        updatedAt: Date.now(),
      })),
      historyLog: [
        ...s.historyLog,
        {
          id: generateId(),
          roundId: null,
          actionType: "scores-reset" as const,
          payload: {},
          timestamp: Date.now(),
        },
      ],
    }));
  },

  resetSession: () => {
    set((s) => ({
      players: s.players.map((p) => ({
        ...p,
        score: 0,
        stats: { timesSelected: 0, correctCount: 0, wrongCount: 0, noAnswerCount: 0, firstCount: 0, secondCount: 0, thirdCount: 0, tieCount: 0 },
        updatedAt: Date.now(),
      })),
      rounds: [],
      historyLog: [
        {
          id: generateId(),
          roundId: null,
          actionType: "session-reset" as const,
          payload: {},
          timestamp: Date.now(),
        },
      ],
      currentRound: null,
      isModalOpen: false,
    }));
  },

  // ─── UI Actions ───────────────────────────────────────
  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowEndGame: (show) => set({ showEndGame: show }),
  setShowPresentation: (show) => set({ showPresentation: show }),
  toggleScoreSidebar: () => set((s) => ({ showScoreSidebar: !s.showScoreSidebar })),
  setShowStats: (show) => set({ showStats: show }),

  // ─── Persistence ──────────────────────────────────────
  hydrate: (data) => {
    set({
      players: data.players,
      config: { ...DEFAULT_CONFIG, ...data.config },
      rounds: data.rounds,
      historyLog: data.historyLog,
      isLoaded: true,
    });
  },
}));
