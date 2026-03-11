import { useStore } from "@/lib/store";

// Reset store state before each test
beforeEach(() => {
  useStore.setState({
    players: [],
    config: {
      id: "default",
      groupSize: 3,
      selectionMode: "random",
      scoringPresets: [
        { label: "+1", value: 1 },
        { label: "-1", value: -1 },
      ],
      allowMultipleWinners: true,
      allowNegativePoints: false,
      showAnimations: false,
      presentationMode: false,
    },
    rounds: [],
    historyLog: [],
    activeTab: "game",
    currentRound: null,
    isModalOpen: false,
    isLoaded: true,
    showEndGame: false,
    showPresentation: false,
  });
});

describe("Player CRUD", () => {
  it("adds a player", () => {
    useStore.getState().addPlayer("Alice");
    const players = useStore.getState().players;
    expect(players).toHaveLength(1);
    expect(players[0].name).toBe("Alice");
    expect(players[0].isActive).toBe(true);
    expect(players[0].score).toBe(0);
  });

  it("bulk adds players", () => {
    useStore.getState().addPlayers(["Alice", "Bob", "Charlie", ""]);
    const players = useStore.getState().players;
    expect(players).toHaveLength(3);
    expect(players.map((p) => p.name)).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("updates a player", () => {
    useStore.getState().addPlayer("Alice");
    const id = useStore.getState().players[0].id;
    useStore.getState().updatePlayer(id, { name: "Alice Updated" });
    expect(useStore.getState().players[0].name).toBe("Alice Updated");
  });

  it("removes a player", () => {
    useStore.getState().addPlayer("Alice");
    useStore.getState().addPlayer("Bob");
    const id = useStore.getState().players[0].id;
    useStore.getState().removePlayer(id);
    expect(useStore.getState().players).toHaveLength(1);
    expect(useStore.getState().players[0].name).toBe("Bob");
  });

  it("toggles active status", () => {
    useStore.getState().addPlayer("Alice");
    const id = useStore.getState().players[0].id;
    expect(useStore.getState().players[0].isActive).toBe(true);
    useStore.getState().togglePlayerActive(id);
    expect(useStore.getState().players[0].isActive).toBe(false);
    useStore.getState().togglePlayerActive(id);
    expect(useStore.getState().players[0].isActive).toBe(true);
  });
});

describe("Game flow", () => {
  it("chooses a group", () => {
    useStore.getState().addPlayers(["A", "B", "C", "D", "E"]);
    useStore.getState().updateConfig({ groupSize: 2 });
    useStore.getState().chooseGroup();
    const round = useStore.getState().currentRound;
    expect(round).not.toBeNull();
    expect(round!.selectedPlayerIds).toHaveLength(2);
    expect(useStore.getState().isModalOpen).toBe(true);
  });

  it("adjusts points for a player", () => {
    useStore.getState().addPlayers(["A", "B", "C"]);
    useStore.getState().updateConfig({ groupSize: 2 });
    useStore.getState().chooseGroup();

    const pid = useStore.getState().currentRound!.selectedPlayerIds[0];
    useStore.getState().adjustPlayerPoints(pid, 1);
    expect(useStore.getState().currentRound!.adjustments[pid]).toBe(1);
    useStore.getState().adjustPlayerPoints(pid, 1);
    expect(useStore.getState().currentRound!.adjustments[pid]).toBe(2);
    useStore.getState().adjustPlayerPoints(pid, -1);
    expect(useStore.getState().currentRound!.adjustments[pid]).toBe(1);
  });

  it("finalizes a round and updates scores", () => {
    useStore.getState().addPlayers(["A", "B", "C"]);
    useStore.getState().updateConfig({ groupSize: 2 });
    useStore.getState().chooseGroup();

    const pid = useStore.getState().currentRound!.selectedPlayerIds[0];
    useStore.getState().adjustPlayerPoints(pid, 2);
    useStore.getState().setPlayerStatus(pid, "correct");
    useStore.getState().finalizeRound();

    expect(useStore.getState().currentRound).toBeNull();
    expect(useStore.getState().isModalOpen).toBe(false);
    expect(useStore.getState().rounds).toHaveLength(1);

    const scorer = useStore.getState().players.find((p) => p.id === pid)!;
    expect(scorer.score).toBe(2);
    expect(scorer.stats.correctCount).toBe(1);
  });

  it("undoes a round", () => {
    useStore.getState().addPlayers(["A", "B", "C"]);
    useStore.getState().updateConfig({ groupSize: 2 });
    useStore.getState().chooseGroup();

    const pid = useStore.getState().currentRound!.selectedPlayerIds[0];
    useStore.getState().adjustPlayerPoints(pid, 3);
    useStore.getState().finalizeRound();

    expect(useStore.getState().players.find((p) => p.id === pid)!.score).toBe(3);
    useStore.getState().undoLastRound();
    expect(useStore.getState().rounds).toHaveLength(0);
    expect(useStore.getState().players.find((p) => p.id === pid)!.score).toBe(0);
  });

  it("discards a round without affecting scores", () => {
    useStore.getState().addPlayers(["A", "B", "C"]);
    useStore.getState().updateConfig({ groupSize: 2 });
    useStore.getState().chooseGroup();

    const pid = useStore.getState().currentRound!.selectedPlayerIds[0];
    useStore.getState().adjustPlayerPoints(pid, 5);
    useStore.getState().discardRound();

    expect(useStore.getState().currentRound).toBeNull();
    expect(useStore.getState().rounds).toHaveLength(0);
    useStore.getState().players.forEach((p) => expect(p.score).toBe(0));
  });
});

describe("Score management", () => {
  it("resets all scores", () => {
    useStore.getState().addPlayers(["A", "B"]);
    useStore.getState().updateConfig({ groupSize: 2 });
    useStore.getState().chooseGroup();
    const pid = useStore.getState().currentRound!.selectedPlayerIds[0];
    useStore.getState().adjustPlayerPoints(pid, 3);
    useStore.getState().finalizeRound();
    useStore.getState().resetAllScores();

    useStore.getState().players.forEach((p) => {
      expect(p.score).toBe(0);
      expect(p.stats.timesSelected).toBe(0);
    });
    // Rounds should still exist
    expect(useStore.getState().rounds).toHaveLength(1);
  });

  it("resets session completely", () => {
    useStore.getState().addPlayers(["A", "B"]);
    useStore.getState().updateConfig({ groupSize: 2 });
    useStore.getState().chooseGroup();
    const pid = useStore.getState().currentRound!.selectedPlayerIds[0];
    useStore.getState().adjustPlayerPoints(pid, 3);
    useStore.getState().finalizeRound();
    useStore.getState().resetSession();

    useStore.getState().players.forEach((p) => {
      expect(p.score).toBe(0);
    });
    expect(useStore.getState().rounds).toHaveLength(0);
    // Players still exist
    expect(useStore.getState().players).toHaveLength(2);
  });
});

describe("Config", () => {
  it("updates group size", () => {
    useStore.getState().setGroupSize(5);
    expect(useStore.getState().config.groupSize).toBe(5);
  });

  it("updates selection mode", () => {
    useStore.getState().setSelectionMode("fairness");
    expect(useStore.getState().config.selectionMode).toBe("fairness");
  });

  it("prevents negative adjustments when not allowed", () => {
    useStore.getState().addPlayers(["A", "B", "C"]);
    useStore.getState().updateConfig({ groupSize: 2, allowNegativePoints: false });
    useStore.getState().chooseGroup();
    const pid = useStore.getState().currentRound!.selectedPlayerIds[0];
    useStore.getState().adjustPlayerPoints(pid, -1);
    // Should remain at 0 since negative not allowed
    expect(useStore.getState().currentRound!.adjustments[pid]).toBe(0);
  });
});
