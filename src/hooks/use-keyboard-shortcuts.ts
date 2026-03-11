"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function useKeyboardShortcuts() {
  const chooseGroup = useStore((s) => s.chooseGroup);
  const rerollGroup = useStore((s) => s.rerollGroup);
  const discardRound = useStore((s) => s.discardRound);
  const isModalOpen = useStore((s) => s.isModalOpen);
  const activeTab = useStore((s) => s.activeTab);
  const undoLastRound = useStore((s) => s.undoLastRound);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "BUTTON" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case "Enter":
          if (!isModalOpen && activeTab === "game") {
            e.preventDefault();
            chooseGroup();
          }
          break;
        case "r":
        case "R":
          if (isModalOpen) {
            e.preventDefault();
            rerollGroup();
          }
          break;
        case "Escape":
          if (isModalOpen) {
            e.preventDefault();
            discardRound();
          }
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            undoLastRound();
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isModalOpen, activeTab, chooseGroup, rerollGroup, discardRound, undoLastRound]);
}
