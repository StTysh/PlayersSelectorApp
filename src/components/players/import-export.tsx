"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import {
  exportPlayersJSON,
  exportPlayersCSV,
  importPlayersJSON,
  importPlayersCSV,
  downloadFile,
} from "@/lib/import-export";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

export function ImportExport() {
  const players = useStore((s) => s.players);
  const importPlayers = useStore((s) => s.importPlayers);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = async () => {
    const json = await exportPlayersJSON(players);
    downloadFile(json, "quiz-players.json", "application/json");
    toast.success("Players exported as JSON");
  };

  const handleExportCSV = () => {
    downloadFile(
      exportPlayersCSV(players),
      "quiz-players.csv",
      "text/csv"
    );
    toast.success("Players exported as CSV");
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const isCSV = file.name.endsWith(".csv");
      const imported = isCSV
        ? importPlayersCSV(text)
        : importPlayersJSON(text);
      importPlayers(imported);
      toast.success(`Imported ${imported.length} player(s)`);
    } catch {
      toast.error("Failed to import file. Check the format.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={handleExportJSON}>
        <Download className="w-4 h-4 mr-1" />
        Export JSON
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportCSV}>
        <Download className="w-4 h-4 mr-1" />
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="w-4 h-4 mr-1" />
        Import
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".json,.csv"
        onChange={handleImportFile}
        className="hidden"
      />
    </div>
  );
}
