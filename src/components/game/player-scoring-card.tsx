"use client";

import React from "react";
import { Avatar } from "@/components/players/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import type { Player, PlayerRoundStatus } from "@/types";
import {
  Plus,
  Minus,
  RotateCcw,
  Check,
  X,
  Clock,
  Trophy,
  Medal,
  Equal,
} from "lucide-react";

interface PlayerScoringCardProps {
  player: Player;
  adjustment: number;
  status: PlayerRoundStatus;
  presentationMode: boolean;
}

const STATUS_OPTIONS: {
  value: PlayerRoundStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "correct",
    label: "Correct",
    icon: <Check className="w-3.5 h-3.5" />,
    color: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  {
    value: "wrong",
    label: "Wrong",
    icon: <X className="w-3.5 h-3.5" />,
    color: "bg-red-500 hover:bg-red-600 text-white",
  },
  {
    value: "no-answer",
    label: "No Answer",
    icon: <Clock className="w-3.5 h-3.5" />,
    color: "bg-gray-500 hover:bg-gray-600 text-white",
  },
  {
    value: "first",
    label: "1st",
    icon: <Trophy className="w-3.5 h-3.5" />,
    color: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  {
    value: "second",
    label: "2nd",
    icon: <Medal className="w-3.5 h-3.5" />,
    color: "bg-slate-400 hover:bg-slate-500 text-white",
  },
  {
    value: "third",
    label: "3rd",
    icon: <Medal className="w-3.5 h-3.5" />,
    color: "bg-amber-700 hover:bg-amber-800 text-white",
  },
  {
    value: "tie",
    label: "Tie",
    icon: <Equal className="w-3.5 h-3.5" />,
    color: "bg-blue-500 hover:bg-blue-600 text-white",
  },
];

export function PlayerScoringCard({
  player,
  adjustment,
  status,
  presentationMode,
}: PlayerScoringCardProps) {
  const adjustPlayerPoints = useStore((s) => s.adjustPlayerPoints);
  const setPlayerAdjustment = useStore((s) => s.setPlayerAdjustment);
  const setPlayerStatus = useStore((s) => s.setPlayerStatus);
  const config = useStore((s) => s.config);

  return (
    <div
      className={`rounded-2xl border-2 bg-card space-y-2 transition-all ${
        presentationMode ? "p-4 space-y-3" : "p-3"
      } ${
        adjustment > 0
          ? "border-emerald-500/50 bg-emerald-500/5"
          : adjustment < 0
          ? "border-red-500/50 bg-red-500/5"
          : "border-border"
      }`}
    >
      <div
        className="grid grid-cols-2 items-stretch gap-3"
      >
        <Avatar
          name={player.name}
          image={player.avatarImage}
          placeholderType={player.avatarPlaceholderType}
          size={presentationMode ? "lg" : "sm"}
          className={`h-full aspect-[7/8] w-auto max-w-full justify-self-start self-stretch ${
            presentationMode ? "min-h-[12.5rem]" : "min-h-[11.5rem]"
          }`}
        />

        <div
          className={`flex min-w-0 flex-col justify-between ${
            presentationMode ? "min-h-[12rem]" : "min-h-[11rem]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div
                className={`font-bold truncate ${
                  presentationMode ? "text-2xl" : "text-base"
                }`}
              >
                {player.name}
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground">
                Total: {player.score}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div
                className={`font-black tabular-nums ${
                  presentationMode ? "text-4xl" : "text-2xl"
                } ${
                  adjustment > 0
                    ? "text-emerald-500"
                    : adjustment < 0
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                {adjustment > 0 ? `+${adjustment}` : adjustment}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {config.scoringPresets
              .filter((preset) => preset.value !== 2)
              .map((preset) => (
              <Button
                key={preset.label}
                variant={preset.value > 0 ? "success" : "destructive"}
                size={presentationMode ? "lg" : "sm"}
                onClick={() => adjustPlayerPoints(player.id, preset.value)}
                className="font-bold min-w-[2.5rem]"
              >
                {preset.value > 0 ? (
                  <Plus className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5 mr-0.5" />
                )}
                {Math.abs(preset.value)}
              </Button>
            ))}
            <Button
              variant="outline"
              size={presentationMode ? "lg" : "sm"}
              onClick={() => setPlayerAdjustment(player.id, 0)}
              title="Reset round points"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {status && (
              <Badge
                variant={
                  status === "correct" ||
                  status === "first" ||
                  status === "second" ||
                  status === "third"
                    ? "success"
                    : status === "wrong"
                    ? "destructive"
                    : "secondary"
                }
                className="text-xs"
              >
                {status}
              </Badge>
            )}
            {STATUS_OPTIONS.filter(
              (opt) => opt.value && config.enabledStatusTags?.[opt.value] !== false
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPlayerStatus(player.id, opt.value)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                  status === opt.value
                    ? opt.color + " ring-2 ring-offset-1 ring-current scale-105"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
