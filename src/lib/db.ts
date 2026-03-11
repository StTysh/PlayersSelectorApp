import Dexie, { type Table } from "dexie";
import type { Player, Round, HistoryEntry, GameConfig } from "@/types";

class QuizDatabase extends Dexie {
  players!: Table<Player, string>;
  rounds!: Table<Round, string>;
  history!: Table<HistoryEntry, string>;
  config!: Table<GameConfig, string>;

  constructor() {
    super("QuizHostDB");
    this.version(1).stores({
      players: "id, name, isActive, createdAt",
      rounds: "id, roundNumber, createdAt",
      history: "id, roundId, actionType, timestamp",
      config: "id",
    });
  }
}

export const db = new QuizDatabase();
