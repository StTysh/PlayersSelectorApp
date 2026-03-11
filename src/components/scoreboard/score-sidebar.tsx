"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/players/avatar";
import { Trophy } from "lucide-react";

export function ScoreSidebar() {
  const players = useStore((s) => s.players);
  const sorted = [...players].sort((a, b) => b.score - a.score);

  const getRank = (index: number, score: number): { rank: number; icon: string | null } => {
    if (index === 0) return { rank: 1, icon: "🥇" };
    if (sorted[index - 1]?.score === score) {
      return getRank(index - 1, score);
    }
    if (index === 1) return { rank: 2, icon: "🥈" };
    if (index === 2) return { rank: 3, icon: "🥉" };
    return { rank: index + 1, icon: null };
  };

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-4 space-y-3">
      <h3 className="font-bold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
        <Trophy className="w-4 h-4 text-amber-500" />
        Live Scores
      </h3>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No players yet
        </p>
      ) : (
        <div className="space-y-1">
          {sorted.map((player, index) => {
            const { rank, icon } = getRank(index, player.score);
            return (
              <div
                key={player.id}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                  rank <= 3 && player.score > 0
                    ? "bg-amber-500/10"
                    : "hover:bg-muted/50"
                } ${!player.isActive ? "opacity-50" : ""}`}
              >
                <span className="w-6 text-center text-sm font-bold flex-shrink-0">
                  {icon || `#${rank}`}
                </span>
                <Avatar
                  name={player.name}
                  image={player.avatarImage}
                  placeholderType={player.avatarPlaceholderType}
                  size="sm"
                />
                <span className="flex-1 min-w-0 text-sm font-medium truncate">
                  {player.name}
                </span>
                <span
                  className={`text-sm font-bold tabular-nums flex-shrink-0 ${
                    player.score > 0
                      ? "text-emerald-500"
                      : player.score < 0
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {player.score}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
