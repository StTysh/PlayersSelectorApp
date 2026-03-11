"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { PlayerScoringCard } from "./player-scoring-card";
import {
  RefreshCw,
  Lock,
  Unlock,
  Check,
  X,
  StickyNote,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { Avatar } from "@/components/players/avatar";

export function ChosenGroupModal() {
  const isModalOpen = useStore((s) => s.isModalOpen);
  const currentRound = useStore((s) => s.currentRound);
  const players = useStore((s) => s.players);
  const config = useStore((s) => s.config);
  const rounds = useStore((s) => s.rounds);
  const rerollGroup = useStore((s) => s.rerollGroup);
  const lockSelection = useStore((s) => s.lockSelection);
  const finalizeRound = useStore((s) => s.finalizeRound);
  const discardRound = useStore((s) => s.discardRound);
  const setRoundNote = useStore((s) => s.setRoundNote);
  const addPlayerToRound = useStore((s) => s.addPlayerToRound);
  const removePlayerFromRound = useStore((s) => s.removePlayerFromRound);
  const closeModal = useStore((s) => s.closeModal);

  const [showNote, setShowNote] = useState(false);
  const [showSwap, setShowSwap] = useState(false);

  if (!currentRound) return null;

  const selectedPlayers = currentRound.selectedPlayerIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as typeof players;

  const availableForSwap = players.filter(
    (p) => p.isActive && !currentRound.selectedPlayerIds.includes(p.id)
  );

  const roundNumber = rounds.length + 1;

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
    >
      <DialogContent
        className={`${
          config.presentationMode
            ? "max-w-6xl h-[95vh]"
            : "max-w-4xl max-h-[90vh]"
        } overflow-y-auto p-6`}
      >
        <DialogTitle className="sr-only">
          Round {roundNumber} - Chosen Group
        </DialogTitle>
        <DialogDescription className="sr-only">
          Award points to selected players for this round
        </DialogDescription>

        <div className="flex items-center justify-start flex-wrap gap-4 mb-4">
          <div>
            <h2
              className={`font-black ${
                config.presentationMode ? "text-3xl" : "text-xl"
              }`}
            >
              Round {roundNumber}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedPlayers.length} player
              {selectedPlayers.length !== 1 ? "s" : ""} selected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={rerollGroup}
              disabled={currentRound.isLocked}
              title="Reroll (R)"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reroll
            </Button>
            <Button
              variant={currentRound.isLocked ? "default" : "outline"}
              size="sm"
              onClick={lockSelection}
              title={currentRound.isLocked ? "Unlock" : "Lock selection"}
            >
              {currentRound.isLocked ? (
                <Lock className="w-4 h-4 mr-1" />
              ) : (
                <Unlock className="w-4 h-4 mr-1" />
              )}
              {currentRound.isLocked ? "Locked" : "Lock"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSwap(!showSwap)}
              disabled={currentRound.isLocked}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Swap
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNote(!showNote)}
            >
              <StickyNote className="w-4 h-4 mr-1" />
              Note
            </Button>
          </div>
        </div>

        {showSwap && !currentRound.isLocked && (
          <div className="rounded-xl border bg-muted/50 p-3 mb-4 space-y-2">
            <div className="text-sm font-medium">Add / Remove Players</div>
            <div className="flex flex-wrap gap-2">
              {availableForSwap.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addPlayerToRound(p.id)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-background border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                >
                  <Avatar name={p.name} image={p.avatarImage} size="sm" />
                  {p.name}
                  <UserPlus className="w-3 h-3 text-emerald-500" />
                </button>
              ))}
              {availableForSwap.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  All active players are already selected
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Click a player in the round below to remove them
            </div>
          </div>
        )}

        {showNote && (
          <div className="mb-4">
            <Textarea
              placeholder="Host notes for this round (e.g., correct answer: The Shawshank Redemption)..."
              value={currentRound.note}
              onChange={(e) => setRoundNote(e.target.value)}
              rows={2}
            />
          </div>
        )}

        <div
          className={`grid items-start gap-4 ${
            config.presentationMode
              ? "grid-cols-1 xl:grid-cols-2"
              : "grid-cols-1 lg:grid-cols-2"
          }`}
        >
          {selectedPlayers.map((player) => (
            <div key={player.id} className="relative min-w-0">
              <PlayerScoringCard
                player={player}
                adjustment={currentRound.adjustments[player.id] || 0}
                status={currentRound.statuses[player.id]}
                presentationMode={config.presentationMode}
              />
              {showSwap && !currentRound.isLocked && (
                <button
                  onClick={() => removePlayerFromRound(player.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  title={`Remove ${player.name}`}
                >
                  <UserMinus className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t">
          <Button variant="ghost" onClick={discardRound}>
            <X className="w-4 h-4 mr-1" />
            Discard
          </Button>
          <Button
            size="lg"
            className="min-w-[200px] font-bold"
            onClick={finalizeRound}
          >
            <Check className="w-5 h-5 mr-2" />
            Finalize Round
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
