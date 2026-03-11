"use client";

import React from "react";
import { Header } from "@/components/layout/header";
import { AppShell } from "@/components/layout/app-shell";
import { usePersistence } from "@/lib/store-persistence";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useStore } from "@/lib/store";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";

export default function Home() {
  usePersistence();
  useKeyboardShortcuts();
  const isLoaded = useStore((s) => s.isLoaded);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground font-medium">Loading quiz data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <AppShell />
      </main>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
