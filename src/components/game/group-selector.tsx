"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { canSelectGroup } from "@/lib/selection";
import { Dices, Minus, Plus } from "lucide-react";

export function GroupSelector() {
  const players = useStore((s) => s.players);
  const config = useStore((s) => s.config);
  const chooseGroup = useStore((s) => s.chooseGroup);
  const updateConfig = useStore((s) => s.updateConfig);
  const rounds = useStore((s) => s.rounds);

  const check = canSelectGroup(players, config.groupSize);
  const activeCount = check.activeCount;

  return (
    <div className="space-y-6">
      {/* Quick group size adjuster */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon-lg"
          onClick={() =>
            updateConfig({
              groupSize: Math.max(1, config.groupSize - 1),
            })
          }
          disabled={config.groupSize <= 1}
        >
          <Minus className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <div className="text-5xl font-black tabular-nums">
            {config.groupSize}
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            player{config.groupSize !== 1 ? "s" : ""} per round
          </div>
        </div>
        <Button
          variant="outline"
          size="icon-lg"
          onClick={() =>
            updateConfig({
              groupSize: Math.min(activeCount, config.groupSize + 1),
            })
          }
          disabled={config.groupSize >= activeCount}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Choose Group button */}
      <Button
        size="xl"
        className="w-full h-16 rounded-2xl text-lg font-black tracking-wide shadow-lg transition-all hover:shadow-xl sm:h-20 sm:text-xl"
        onClick={chooseGroup}
        disabled={!check.possible}
      >
        <Dices className="w-8 h-8 mr-3" />
        CHOOSE GROUP
      </Button>

      {!check.possible && check.reason && (
        <p className="text-center text-sm text-destructive font-medium">
          {check.reason}
        </p>
      )}

      <div className="text-center text-sm text-muted-foreground">
        <span className="font-medium">{activeCount}</span> active players -{" "}
        <span className="font-medium">{rounds.length}</span> rounds played -{" "}
        <span className="capitalize">{config.selectionMode.replace("-", " ")}</span>{" "}
        mode
      </div>
    </div>
  );
}
