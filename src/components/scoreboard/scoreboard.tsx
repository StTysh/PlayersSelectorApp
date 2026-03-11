"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/players/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { accuracyPercent } from "@/lib/scoring";
import {
  Trophy,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Award,
  Monitor,
} from "lucide-react";

export function Scoreboard() {
  const players = useStore((s) => s.players);
  const config = useStore((s) => s.config);
  const resetAllScores = useStore((s) => s.resetAllScores);
  const resetSession = useStore((s) => s.resetSession);
  const setShowEndGame = useStore((s) => s.setShowEndGame);
  const setShowPresentation = useStore((s) => s.setShowPresentation);
  const showStats = useStore((s) => s.showStats);
  const setShowStats = useStore((s) => s.setShowStats);
  const [showResetScores, setShowResetScores] = useState(false);
  const [showResetSession, setShowResetSession] = useState(false);

  const sorted = [...players].sort((a, b) => b.score - a.score);

  const getRankDisplay = (index: number, score: number): { rank: number; icon: string | null } => {
    if (index === 0) return { rank: 1, icon: "🥇" };
    // Check for ties with previous player
    if (sorted[index - 1]?.score === score) {
      const prevRank = getRankDisplay(index - 1, score);
      return prevRank;
    }
    if (index === 1) return { rank: 2, icon: "🥈" };
    if (index === 2) return { rank: 3, icon: "🥉" };
    return { rank: index + 1, icon: null };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          Scoreboard
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? (
              <ChevronUp className="w-4 h-4 mr-1" />
            ) : (
              <ChevronDown className="w-4 h-4 mr-1" />
            )}
            {showStats ? "Hide" : "Show"} Stats
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPresentation(true)}
          >
            <Monitor className="w-4 h-4 mr-1" />
            Present
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEndGame(true)}
          >
            <Award className="w-4 h-4 mr-1" />
            Final Standings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetScores(true)}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset Scores
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={() => setShowResetSession(true)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Reset Session
          </Button>
        </div>
      </div>

      {/* Scoreboard table */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="text-6xl">🏆</div>
          <h3 className="text-xl font-semibold">No scores yet</h3>
          <p className="text-muted-foreground">Start a round to see scores here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((player, index) => {
            const { rank, icon } = getRankDisplay(index, player.score);
            const accuracy = accuracyPercent(player);
            return (
              <div
                key={player.id}
                className={`rounded-2xl border-2 p-4 flex items-center gap-4 transition-all ${
                  rank <= 3 && player.score > 0
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-border bg-card"
                } ${!player.isActive ? "opacity-60" : ""} ${
                  config.presentationMode ? "p-6" : ""
                }`}
              >
                {/* Rank */}
                <div
                  className={`font-black tabular-nums text-center w-10 ${
                    config.presentationMode ? "text-3xl" : "text-xl"
                  }`}
                >
                  {icon || `#${rank}`}
                </div>

                {/* Avatar */}
                <Avatar
                  name={player.name}
                  image={player.avatarImage}
                  placeholderType={player.avatarPlaceholderType}
                  size={config.presentationMode ? "xl" : "lg"}
                />

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-bold truncate ${
                      config.presentationMode ? "text-2xl" : "text-lg"
                    }`}
                  >
                    {player.name}
                  </div>
                  {showStats && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {player.stats.timesSelected > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Selected {player.stats.timesSelected}×
                        </Badge>
                      )}
                      {player.stats.correctCount > 0 && (
                        <Badge variant="success" className="text-xs">
                          ✓ {player.stats.correctCount}
                        </Badge>
                      )}
                      {player.stats.wrongCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          ✗ {player.stats.wrongCount}
                        </Badge>
                      )}
                      {player.stats.noAnswerCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Skip {player.stats.noAnswerCount}
                        </Badge>
                      )}
                      {(player.stats.firstCount || 0) > 0 && (
                        <Badge className="text-xs bg-amber-500 text-white">
                          🥇 {player.stats.firstCount}×
                        </Badge>
                      )}
                      {(player.stats.secondCount || 0) > 0 && (
                        <Badge className="text-xs bg-slate-400 text-white">
                          🥈 {player.stats.secondCount}×
                        </Badge>
                      )}
                      {(player.stats.thirdCount || 0) > 0 && (
                        <Badge className="text-xs bg-amber-700 text-white">
                          🥉 {player.stats.thirdCount}×
                        </Badge>
                      )}
                      {(player.stats.tieCount || 0) > 0 && (
                        <Badge className="text-xs bg-blue-500 text-white">
                          ⚖ {player.stats.tieCount}×
                        </Badge>
                      )}
                      {player.stats.timesSelected > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {accuracy}% accuracy
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Score */}
                <div
                  className={`font-black tabular-nums ${
                    config.presentationMode ? "text-4xl" : "text-2xl"
                  } ${
                    player.score > 0
                      ? "text-emerald-500"
                      : player.score < 0
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {player.score}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={showResetScores}
        onOpenChange={setShowResetScores}
        title="Reset All Scores"
        description="This will reset all player scores and stats to zero. Players will be kept."
        confirmLabel="Reset Scores"
        variant="destructive"
        onConfirm={resetAllScores}
      />
      <ConfirmationDialog
        open={showResetSession}
        onOpenChange={setShowResetSession}
        title="Reset Entire Session"
        description="This will reset all scores, stats, and clear round history. Players will be kept."
        confirmLabel="Reset Session"
        variant="destructive"
        onConfirm={resetSession}
      />
    </div>
  );
}
