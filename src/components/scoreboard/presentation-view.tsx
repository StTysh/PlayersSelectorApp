"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/players/avatar";
import { X } from "lucide-react";

export function PresentationView() {
  const showPresentation = useStore((s) => s.showPresentation);
  const setShowPresentation = useStore((s) => s.setShowPresentation);
  const players = useStore((s) => s.players);

  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <Dialog open={showPresentation} onOpenChange={setShowPresentation}>
      <DialogContent className="max-w-6xl h-[95vh] overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 text-white border-slate-700 p-8">
        <DialogTitle className="text-4xl font-black text-center mb-2 text-white">
          Scoreboard
        </DialogTitle>
        <DialogDescription className="text-center text-slate-400 text-lg mb-6">
          Live standings
        </DialogDescription>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/10"
          onClick={() => setShowPresentation(false)}
        >
          <X className="w-6 h-6" />
        </Button>

        <div className="space-y-3">
          {sorted.map((player, index) => {
            const icons = ["1st", "2nd", "3rd"];
            let rank = index;
            while (rank > 0 && sorted[rank - 1].score === player.score) {
              rank--;
            }

            return (
              <div
                key={player.id}
                className={`flex items-center gap-6 rounded-2xl px-6 py-4 ${
                  rank < 3
                    ? "bg-white/10 border border-white/20"
                    : "bg-white/5"
                } ${!player.isActive ? "opacity-50" : ""}`}
              >
                <div className="text-4xl font-black w-16 text-center">
                  {icons[rank] || `#${rank + 1}`}
                </div>
                <Avatar
                  name={player.name}
                  image={player.avatarImage}
                  size="xl"
                />
                <div className="flex-1 font-bold text-3xl">{player.name}</div>
                <div className="text-5xl font-black tabular-nums text-amber-400">
                  {player.score}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
