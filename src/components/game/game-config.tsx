"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GameConfig() {
  const config = useStore((s) => s.config);
  const players = useStore((s) => s.players);
  const updateConfig = useStore((s) => s.updateConfig);

  const activeCount = players.filter((p) => p.isActive).length;
  const maxGroup = Math.max(1, activeCount);

  return (
    <div className="space-y-6 rounded-2xl border-2 bg-card p-6">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Settings2 className="w-5 h-5" />
        Game Settings
      </h3>

      {/* Group Size */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">
          Group Size: {config.groupSize}
        </Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              updateConfig({
                groupSize: Math.max(1, config.groupSize - 1),
              })
            }
            disabled={config.groupSize <= 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <div className="flex-1 bg-muted rounded-full h-3 relative">
            <div
              className="bg-primary rounded-full h-3 transition-all"
              style={{
                width: `${(config.groupSize / maxGroup) * 100}%`,
              }}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              updateConfig({
                groupSize: Math.min(maxGroup, config.groupSize + 1),
              })
            }
            disabled={config.groupSize >= maxGroup}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-16 text-right">
            of {activeCount}
          </span>
        </div>
      </div>

      {/* Selection Mode */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Selection Mode</Label>
        <Select
          value={config.selectionMode}
          onValueChange={(v) =>
            updateConfig({
              selectionMode: v as "random" | "avoid-repeats" | "fairness",
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="random">Fully Random</SelectItem>
            <SelectItem value="avoid-repeats">Avoid Immediate Repeats</SelectItem>
            <SelectItem value="fairness">Fairness Mode</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {config.selectionMode === "random" &&
            "Pure random selection each round."}
          {config.selectionMode === "avoid-repeats" &&
            "Avoids choosing the exact same group twice in a row."}
          {config.selectionMode === "fairness" &&
            "Biases selection toward players who have been chosen less often."}
        </p>
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Allow multiple winners per round</Label>
          <Switch
            checked={config.allowMultipleWinners}
            onCheckedChange={(v) => updateConfig({ allowMultipleWinners: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Allow negative points</Label>
          <Switch
            checked={config.allowNegativePoints}
            onCheckedChange={(v) => updateConfig({ allowNegativePoints: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Animations & effects</Label>
          <Switch
            checked={config.showAnimations}
            onCheckedChange={(v) => updateConfig({ showAnimations: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Presentation mode (large display)</Label>
          <Switch
            checked={config.presentationMode}
            onCheckedChange={(v) => updateConfig({ presentationMode: v })}
          />
        </div>
      </div>

      {/* Status Tags */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Status Tags</Label>
        <p className="text-xs text-muted-foreground">
          Toggle which tags are available when scoring a round
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "correct", label: "Correct" },
            { key: "wrong", label: "Wrong" },
            { key: "no-answer", label: "No Answer" },
            { key: "first", label: "1st" },
            { key: "second", label: "2nd" },
            { key: "third", label: "3rd" },
            { key: "tie", label: "Tie" },
          ].map((tag) => (
            <div key={tag.key} className="flex items-center justify-between">
              <Label className="text-sm">{tag.label}</Label>
              <Switch
                checked={config.enabledStatusTags?.[tag.key] !== false}
                onCheckedChange={(v) =>
                  updateConfig({
                    enabledStatusTags: {
                      ...config.enabledStatusTags,
                      [tag.key]: v,
                    },
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
