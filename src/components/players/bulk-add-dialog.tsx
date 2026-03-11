"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";

interface BulkAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkAddDialog({ open, onOpenChange }: BulkAddDialogProps) {
  const [text, setText] = useState("");
  const addPlayers = useStore((s) => s.addPlayers);

  const names = text
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);

  const handleAdd = () => {
    if (names.length === 0) return;
    addPlayers(names);
    setText("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Add Players</DialogTitle>
          <DialogDescription>
            Paste player names, one per line. They will be added with default
            settings.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Alex\nJordan\nSam\nTaylor\n..."}
          rows={10}
          className="font-mono"
        />
        <div className="text-sm text-muted-foreground">
          {names.length} player{names.length !== 1 ? "s" : ""} to add
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={names.length === 0}>
            Add {names.length} Player{names.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
