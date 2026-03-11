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
  it("does not choose a group when selection is impossible", () => {
    useStore.getState().updateConfig({ groupSize: 3 });
    useStore.getState().chooseGroup();

    expect(useStore.getState().currentRound).toBeNull();
    expect(useStore.getState().isModalOpen).toBe(false);
  });

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

  it("does not reroll when the current round is locked", () => {
    useStore.getState().addPlayers(["A", "B", "C", "D"]);
    useStore.getState().updateConfig({ groupSize: 2 });
    useStore.getState().chooseGroup();

    const initialIds = [...useStore.getState().currentRound!.selectedPlayerIds];
    useStore.getState().lockSelection();
    useStore.getState().rerollGroup();

    expect(useStore.getState().currentRound!.selectedPlayerIds).toEqual(initialIds);
  });

  it("swaps a player and clears old adjustment/status bookkeeping", () => {
    useStore.getState().addPlayers(["A", "B", "C", "D"]);
    useStore.getState().updateConfig({ groupSize: 2 });
    useStore.getState().chooseGroup();

    const currentRound = useStore.getState().currentRound!;
    const outId = currentRound.selectedPlayerIds[0];
    const inId = useStore
      .getState()
      .players.find((p) => !currentRound.selectedPlayerIds.includes(p.id))!.id;

    useStore.getState().setPlayerAdjustment(outId, 3);
    useStore.getState().setPlayerStatus(outId, "correct");
    useStore.getState().swapPlayer(outId, inId);

    const updatedRound = useStore.getState().currentRound!;
    expect(updatedRound.selectedPlayerIds).toContain(inId);
    expect(updatedRound.selectedPlayerIds).not.toContain(outId);
    expect(updatedRound.adjustments[outId]).toBeUndefined();
    expect(updatedRound.statuses[outId]).toBeUndefined();
    expect(updatedRound.adjustments[inId]).toBe(0);
    expect(updatedRound.statuses[inId]).toBeNull();
  });

  it("does not swap players when the round is locked", () => {
    useStore.getState().addPlayers(["A", "B", "C", "D"]);
    useStore.getState().updateConfig({ groupSize: 2 });
    useStore.getState().chooseGroup();

    const currentRound = useStore.getState().currentRound!;
    const outId = currentRound.selectedPlayerIds[0];
    const inId = useStore
      .getState()
      .players.find((p) => !currentRound.selectedPlayerIds.includes(p.id))!.id;

    useStore.getState().lockSelection();
    useStore.getState().swapPlayer(outId, inId);

    expect(useStore.getState().currentRound!.selectedPlayerIds).toEqual(
      currentRound.selectedPlayerIds
    );
  });

  it("ignores duplicate additions and clears bookkeeping on remove", () => {
    useStore.getState().addPlayers(["A", "B", "C", "D"]);
    useStore.getState().updateConfig({ groupSize: 2 });
    useStore.getState().chooseGroup();

    const currentRound = useStore.getState().currentRound!;
    const existingId = currentRound.selectedPlayerIds[0];
    const extraId = useStore
      .getState()
      .players.find((p) => !currentRound.selectedPlayerIds.includes(p.id))!.id;

    useStore.getState().addPlayerToRound(existingId);
    expect(useStore.getState().currentRound!.selectedPlayerIds).toHaveLength(2);

    useStore.getState().addPlayerToRound(extraId);
    expect(useStore.getState().currentRound!.selectedPlayerIds).toContain(extraId);

    useStore.getState().removePlayerFromRound(existingId);
    expect(useStore.getState().currentRound!.selectedPlayerIds).not.toContain(
      existingId
    );
    expect(useStore.getState().currentRound!.adjustments[existingId]).toBeUndefined();
    expect(useStore.getState().currentRound!.statuses[existingId]).toBeUndefined();
  });

  it("toggles a player status off when the same status is selected twice", () => {
    useStore.getState().addPlayers(["A", "B", "C"]);
    useStore.getState().updateConfig({ groupSize: 2 });
    useStore.getState().chooseGroup();

    const pid = useStore.getState().currentRound!.selectedPlayerIds[0];
    useStore.getState().setPlayerStatus(pid, "correct");
    expect(useStore.getState().currentRound!.statuses[pid]).toBe("correct");

    useStore.getState().setPlayerStatus(pid, "correct");
    expect(useStore.getState().currentRound!.statuses[pid]).toBeNull();
  });

  it("records actual applied points when round finalization clamps a negative score", () => {
    useStore.getState().addPlayers(["A", "B", "C"]);
    useStore.getState().players.forEach((player) => {
      useStore.getState().updatePlayer(player.id, { score: 1 });
    });
    useStore.getState().updateConfig({ groupSize: 1, allowNegativePoints: false });
    useStore.getState().chooseGroup();

    const selectedId = useStore.getState().currentRound!.selectedPlayerIds[0];
    useStore.getState().setPlayerAdjustment(selectedId, -5);
    useStore.getState().finalizeRound();

    const lastRound = useStore.getState().rounds[0];
    const result = lastRound.results.find((r) => r.playerId === selectedId)!;
    const updatedPlayer = useStore.getState().players.find((p) => p.id === selectedId)!;

    expect(updatedPlayer.score).toBe(0);
    expect(result.pointsAwarded).toBe(-1);
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

  it("toggles the score sidebar", () => {
    expect(useStore.getState().showScoreSidebar).toBe(false);
    useStore.getState().toggleScoreSidebar();
    expect(useStore.getState().showScoreSidebar).toBe(true);
    useStore.getState().toggleScoreSidebar();
    expect(useStore.getState().showScoreSidebar).toBe(false);
  });
});
