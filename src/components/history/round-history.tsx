"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/players/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import {
  exportHistoryJSON,
  downloadFile,
} from "@/lib/import-export";
import { formatDate } from "@/lib/utils";
import {
  History,
  Undo2,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export function RoundHistory() {
  const rounds = useStore((s) => s.rounds);
  const historyLog = useStore((s) => s.historyLog);
  const players = useStore((s) => s.players);
  const undoLastRound = useStore((s) => s.undoLastRound);
  const resetSession = useStore((s) => s.resetSession);
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  const handleExport = () => {
    downloadFile(
      exportHistoryJSON(rounds, historyLog),
      "quiz-history.json",
      "application/json"
    );
    toast.success("History exported");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <History className="w-6 h-6" />
          Round History
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undoLastRound}
            disabled={rounds.length === 0}
          >
            <Undo2 className="w-4 h-4 mr-1" />
            Undo Last Round
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={() => setShowClearConfirm(true)}
            disabled={rounds.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Rounds */}
      {rounds.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="text-6xl">📋</div>
          <h3 className="text-xl font-semibold">No rounds yet</h3>
          <p className="text-muted-foreground">
            Play some rounds to see history here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...rounds].reverse().map((round) => (
            <div
              key={round.id}
              className="rounded-2xl border-2 bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-sm px-3 py-1">
                    Round {round.roundNumber}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(round.createdAt)}
                  </span>
                </div>
              </div>

              {/* Selected players and their results */}
              <div className="flex flex-wrap gap-3">
                {round.results.map((result) => {
                  const player = getPlayer(result.playerId);
                  if (!player) return null;
                  return (
                    <div
                      key={result.playerId}
                      className="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2"
                    >
                      <Avatar
                        name={player.name}
                        image={player.avatarImage}
                        size="sm"
                      />
                      <span className="font-medium text-sm">{player.name}</span>
                      <span
                        className={`font-bold text-sm ${
                          result.pointsAwarded > 0
                            ? "text-emerald-500"
                            : result.pointsAwarded < 0
                            ? "text-red-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {result.pointsAwarded > 0 ? "+" : ""}
                        {result.pointsAwarded}
                      </span>
                      {result.status && (
                        <Badge
                          variant={
                            result.status === "correct" ||
                            result.status === "first" ||
                            result.status === "second" ||
                            result.status === "third"
                              ? "success"
                              : result.status === "wrong"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {result.status}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Note */}
              {round.note && (
                <div className="text-sm text-muted-foreground italic bg-muted/50 rounded-lg px-3 py-2">
                  📝 {round.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title="Clear History"
        description="This will reset all scores, stats, and round history. Players will be kept."
        confirmLabel="Clear Everything"
        variant="destructive"
        onConfirm={resetSession}
      />
    </div>
  );
}
