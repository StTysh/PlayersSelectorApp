"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlayerManager } from "@/components/players/player-manager";
import { GroupSelector } from "@/components/game/group-selector";
import { GameConfig } from "@/components/game/game-config";
import { ChosenGroupModal } from "@/components/game/chosen-group-modal";
import { Scoreboard } from "@/components/scoreboard/scoreboard";
import { ScoreSidebar } from "@/components/scoreboard/score-sidebar";
import { PresentationView } from "@/components/scoreboard/presentation-view";
import { EndGameView } from "@/components/scoreboard/end-game-view";
import { RoundHistory } from "@/components/history/round-history";
import { Button } from "@/components/ui/button";
import { Users, Dices, Trophy, History, PanelRightOpen, PanelRightClose } from "lucide-react";
import type { AppTab } from "@/types";

export function AppShell() {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const showScoreSidebar = useStore((s) => s.showScoreSidebar);
  const toggleScoreSidebar = useStore((s) => s.toggleScoreSidebar);

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as AppTab)}
        className="w-full"
      >
        <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-4 h-14">
          <TabsTrigger value="game" className="gap-1.5 text-sm font-bold">
            <Dices className="w-4 h-4" />
            <span className="hidden sm:inline">Game</span>
          </TabsTrigger>
          <TabsTrigger value="players" className="gap-1.5 text-sm font-bold">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Players</span>
          </TabsTrigger>
          <TabsTrigger value="scoreboard" className="gap-1.5 text-sm font-bold">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Scores</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5 text-sm font-bold">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="game">
          <div className="space-y-6 xl:grid xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start xl:gap-6 xl:space-y-0">
            <div className="space-y-6 min-w-0">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleScoreSidebar}
                  className="gap-1.5"
                >
                  {showScoreSidebar ? (
                    <PanelRightClose className="w-4 h-4" />
                  ) : (
                    <PanelRightOpen className="w-4 h-4" />
                  )}
                  {showScoreSidebar ? "Hide Scores" : "Show Scores"}
                </Button>
              </div>
              <GroupSelector />
              <GameConfig />
            </div>

            {showScoreSidebar && (
              <div className="min-w-0 xl:sticky xl:top-20">
                <ScoreSidebar />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="players">
          <PlayerManager />
        </TabsContent>

        <TabsContent value="scoreboard">
          <Scoreboard />
        </TabsContent>

        <TabsContent value="history">
          <RoundHistory />
        </TabsContent>
      </Tabs>

      {/* Global modals */}
      <ChosenGroupModal />
      <PresentationView />
      <EndGameView />
    </>
  );
}
