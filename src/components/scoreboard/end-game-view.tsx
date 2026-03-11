"use client";

import React, { useEffect, useRef } from "react";
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

export function EndGameView() {
  const showEndGame = useStore((s) => s.showEndGame);
  const setShowEndGame = useStore((s) => s.setShowEndGame);
  const players = useStore((s) => s.players);
  const config = useStore((s) => s.config);
  const confettiTriggered = useRef(false);

  const sorted = [...players]
    .filter((p) => p.score > 0 || p.stats.timesSelected > 0)
    .sort((a, b) => b.score - a.score);

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  useEffect(() => {
    if (showEndGame && config.showAnimations && !confettiTriggered.current) {
      confettiTriggered.current = true;
      import("canvas-confetti")
        .then((mod) => {
          const confetti = mod.default;
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
          setTimeout(() => {
            confetti({ particleCount: 80, spread: 120, origin: { y: 0.5 } });
          }, 500);
        })
        .catch(() => {});
    }
    if (!showEndGame) {
      confettiTriggered.current = false;
    }
  }, [showEndGame, config.showAnimations]);

  return (
    <Dialog open={showEndGame} onOpenChange={setShowEndGame}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white border-purple-700 p-8">
        <DialogTitle className="text-4xl font-black text-center mb-0 text-white">
          Final Standings
        </DialogTitle>
        <DialogDescription className="text-center text-purple-300 text-lg mb-6">
          Great game everyone!
        </DialogDescription>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/10"
          onClick={() => setShowEndGame(false)}
        >
          <X className="w-6 h-6" />
        </Button>

        {top3.length > 0 && (
          <div className="flex items-end justify-center gap-4 mb-10 pt-4">
            {top3[1] && (
              <div className="flex flex-col items-center">
                <Avatar
                  name={top3[1].name}
                  image={top3[1].avatarImage}
                  size="xl"
                />
                <div className="font-bold text-lg mt-2">{top3[1].name}</div>
                <div className="text-3xl font-black text-slate-300">
                  {top3[1].score}
                </div>
                <div className="w-24 h-20 bg-slate-600 rounded-t-lg mt-2 flex items-center justify-center text-4xl">
                  2nd
                </div>
              </div>
            )}
            {top3[0] && (
              <div className="flex flex-col items-center">
                <Avatar
                  name={top3[0].name}
                  image={top3[0].avatarImage}
                  size="2xl"
                />
                <div className="font-bold text-xl mt-2">{top3[0].name}</div>
                <div className="text-4xl font-black text-amber-400">
                  {top3[0].score}
                </div>
                <div className="w-28 h-28 bg-amber-700 rounded-t-lg mt-2 flex items-center justify-center text-5xl">
                  1st
                </div>
              </div>
            )}
            {top3[2] && (
              <div className="flex flex-col items-center">
                <Avatar
                  name={top3[2].name}
                  image={top3[2].avatarImage}
                  size="xl"
                />
                <div className="font-bold text-lg mt-2">{top3[2].name}</div>
                <div className="text-3xl font-black text-amber-700">
                  {top3[2].score}
                </div>
                <div className="w-24 h-14 bg-amber-900 rounded-t-lg mt-2 flex items-center justify-center text-4xl">
                  3rd
                </div>
              </div>
            )}
          </div>
        )}

        {rest.length > 0 && (
          <div className="space-y-2">
            {rest.map((player, idx) => {
              const globalIdx = idx + top3.length;
              let rank = globalIdx;
              while (rank > 0 && sorted[rank - 1].score === player.score) {
                rank--;
              }

              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-4 rounded-xl bg-white/5 px-4 py-3 ${
                    !player.isActive ? "opacity-50" : ""
                  }`}
                >
                  <span className="w-8 text-center text-lg font-bold text-slate-400">
                    #{rank + 1}
                  </span>
                  <Avatar
                    name={player.name}
                    image={player.avatarImage}
                    size="md"
                  />
                  <span className="flex-1 font-semibold">{player.name}</span>
                  <span className="text-xl font-bold tabular-nums">
                    {player.score}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {sorted.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-xl">No scores recorded yet</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
