"use client";

import React, { useState } from "react";
import { Avatar } from "./avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { Edit2, Trash2, UserX, UserCheck, Pencil } from "lucide-react";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { PlayerForm } from "./player-form";
import { uploadAvatarFile } from "@/lib/avatar-utils";
import type { Player } from "@/types";

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingScore, setEditingScore] = useState(false);
  const [scoreValue, setScoreValue] = useState(String(player.score));
  const scoreSubmittedRef = React.useRef(false);
  const updatePlayer = useStore((s) => s.updatePlayer);
  const removePlayer = useStore((s) => s.removePlayer);
  const togglePlayerActive = useStore((s) => s.togglePlayerActive);

  if (isEditing) {
    return (
      <div className="rounded-2xl border-2 border-primary/30 bg-card p-4">
        <PlayerForm
          initialName={player.name}
          initialAvatar={player.avatarImage}
          initialPlaceholderType={player.avatarPlaceholderType}
          submitLabel="Save"
          onSubmit={async (data) => {
            updatePlayer(player.id, data);
            setIsEditing(false);
            if (data.avatarFile) {
              try {
                const url = await uploadAvatarFile(data.avatarFile, player.id);
                updatePlayer(player.id, { avatarImage: url });
              } catch {
                // keep base64 fallback
              }
            }
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <>
      <div
        className={`group rounded-2xl border-2 bg-card p-4 flex items-center gap-4 transition-all ${
          player.isActive
            ? "border-border hover:border-primary/30"
            : "border-border/50 opacity-60"
        }`}
      >
        <Avatar
          name={player.name}
          image={player.avatarImage}
          placeholderType={player.avatarPlaceholderType}
          size="lg"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg truncate">{player.name}</span>
            {!player.isActive && (
              <Badge variant="secondary" className="text-xs">
                Inactive
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            {editingScore ? (
              <form
                className="flex items-center gap-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  scoreSubmittedRef.current = true;
                  const newScore = parseInt(scoreValue, 10);
                  if (!isNaN(newScore)) {
                    updatePlayer(player.id, { score: newScore });
                  }
                  setEditingScore(false);
                }}
              >
                <Input
                  type="number"
                  value={scoreValue}
                  onChange={(e) => setScoreValue(e.target.value)}
                  className="w-20 h-7 text-sm"
                  autoFocus
                  onBlur={() => {
                    if (scoreSubmittedRef.current) {
                      scoreSubmittedRef.current = false;
                      return;
                    }
                    const newScore = parseInt(scoreValue, 10);
                    if (!isNaN(newScore)) {
                      updatePlayer(player.id, { score: newScore });
                    }
                    setEditingScore(false);
                  }}
                />
              </form>
            ) : (
              <button
                className="font-bold text-foreground text-base hover:text-primary transition-colors inline-flex items-center gap-1"
                onClick={() => {
                  setScoreValue(String(player.score));
                  setEditingScore(true);
                }}
                title="Click to edit score"
              >
                {player.score} pts
                <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50" />
              </button>
            )}
            <span>Selected {player.stats.timesSelected}×</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => togglePlayerActive(player.id)}
            title={player.isActive ? "Mark as inactive" : "Mark as active"}
          >
            {player.isActive ? (
              <UserCheck className="w-4 h-4 text-emerald-500" />
            ) : (
              <UserX className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Remove Player"
        description={`Remove "${player.name}" from the game? This cannot be undone.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => removePlayer(player.id)}
      />
    </>
  );
}
