import { useEffect, useRef } from "react";
import { db } from "./db";
import { useStore } from "./store";

/**
 * Load all data from IndexedDB into Zustand on mount.
 * Save changes back to IndexedDB on state updates (debounced).
 */
export function usePersistence() {
  const hydrate = useStore((s) => s.hydrate);
  const isLoaded = useStore((s) => s.isLoaded);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate on mount
  useEffect(() => {
    async function load() {
      try {
        const [players, rounds, historyLog, configs] = await Promise.all([
          db.players.toArray(),
          db.rounds.orderBy("roundNumber").toArray(),
          db.history.orderBy("timestamp").toArray(),
          db.config.toArray(),
        ]);
        const config = configs[0] || undefined;
        hydrate({
          players,
          config: config || ({} as never),
          rounds,
          historyLog,
        });
      } catch {
        // First load or empty DB
        hydrate({
          players: [],
          config: {} as never,
          rounds: [],
          historyLog: [],
        });
      }
    }
    load();
  }, [hydrate]);

  // Subscribe to changes and persist
  useEffect(() => {
    if (!isLoaded) return;
    let persistingRef = false;

    const unsub = useStore.subscribe((state, prevState) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (persistingRef) return;
        persistingRef = true;
        try {
          // Players
          if (state.players !== prevState.players) {
            await db.transaction("rw", db.players, async () => {
              await db.players.clear();
              if (state.players.length > 0) {
                await db.players.bulkPut(state.players);
              }
            });
          }
          // Config
          if (state.config !== prevState.config) {
            await db.config.put(state.config);
          }
          // Rounds
          if (state.rounds !== prevState.rounds) {
            await db.transaction("rw", db.rounds, async () => {
              await db.rounds.clear();
              if (state.rounds.length > 0) {
                await db.rounds.bulkPut(state.rounds);
              }
            });
          }
          // History
          if (state.historyLog !== prevState.historyLog) {
            await db.transaction("rw", db.history, async () => {
              await db.history.clear();
              if (state.historyLog.length > 0) {
                await db.history.bulkPut(state.historyLog);
              }
            });
          }
        } catch (e) {
          console.error("Persistence error:", e);
        } finally {
          persistingRef = false;
        }
      }, 300);
    });

    return () => {
      unsub();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [isLoaded]);
}
