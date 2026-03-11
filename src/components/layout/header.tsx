"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { Clapperboard, Maximize, Minimize, Keyboard } from "lucide-react";

export function Header() {
  const config = useStore((s) => s.config);
  const rounds = useStore((s) => s.rounds);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <header className="border-b-2 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clapperboard className="w-7 h-7 text-primary" />
          <div>
            <h1 className="text-xl font-black tracking-tight">Quiz Host</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Movie Quiz Control Panel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {rounds.length > 0 && (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Round {rounds.length}
            </Badge>
          )}
          {config.presentationMode && (
            <Badge variant="warning">Presentation</Badge>
          )}
          <div className="hidden md:flex items-center text-xs text-muted-foreground gap-1">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Enter - R - Esc</span>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
