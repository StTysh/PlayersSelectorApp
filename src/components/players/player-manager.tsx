"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { PlayerCard } from "./player-card";
import { PlayerForm } from "./player-form";
import { BulkAddDialog } from "./bulk-add-dialog";
import { ImportExport } from "./import-export";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { uploadAvatarFile } from "@/lib/avatar-utils";
import { generateSeedPlayers } from "@/lib/seed-data";
import { Plus, Users, Wand2 } from "lucide-react";

export function PlayerManager() {
  const players = useStore((s) => s.players);
  const setPlayers = useStore((s) => s.setPlayers);
  const addPlayer = useStore((s) => s.addPlayer);
  const updatePlayer = useStore((s) => s.updatePlayer);
  const [showForm, setShowForm] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const activeCount = players.filter((p) => p.isActive).length;

  const handleLoadDemo = () => {
    if (players.length > 0) return;
    const demoPlayers = generateSeedPlayers(12);
    setPlayers(demoPlayers);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Players
          </h2>
          <p className="text-muted-foreground">
            {players.length} total · {activeCount} active
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowForm(!showForm)} size="lg">
            <Plus className="w-5 h-5 mr-1" />
            Add Player
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBulkAdd(true)}
          >
            Bulk Add
          </Button>
          {players.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(true)}
              className="text-destructive"
            >
              Remove All
            </Button>
          )}
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-card/50 p-4">
          <PlayerForm
            onSubmit={async (data) => {
              addPlayer(data.name, data.avatarImage, data.avatarPlaceholderType);
              // Upload file to app folder in background
              if (data.avatarFile) {
                const players = useStore.getState().players;
                const newPlayer = players[players.length - 1];
                if (newPlayer) {
                  try {
                    const url = await uploadAvatarFile(data.avatarFile, newPlayer.id);
                    updatePlayer(newPlayer.id, { avatarImage: url });
                  } catch {
                    // keep base64 fallback
                  }
                }
              }
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Import/Export */}
      <ImportExport />

      {/* Player list */}
      {players.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="text-6xl">🎬</div>
          <h3 className="text-xl font-semibold">No players yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Add players to get started! You can add them one by one, bulk paste
            names, import from a file, or load demo data.
          </p>
          <Button variant="outline" onClick={handleLoadDemo}>
            <Wand2 className="w-4 h-4 mr-2" />
            Load Demo Players
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {[...players].sort((a, b) => a.name.localeCompare(b.name)).map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <BulkAddDialog open={showBulkAdd} onOpenChange={setShowBulkAdd} />

      <ConfirmationDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="Remove All Players"
        description="This will permanently delete all players and their data. This cannot be undone."
        confirmLabel="Remove All"
        variant="destructive"
        onConfirm={() => setPlayers([])}
      />
    </div>
  );
}
