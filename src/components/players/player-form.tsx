"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "./avatar";
import { compressAvatar } from "@/lib/avatar-utils";
import { Camera, X } from "lucide-react";
import type { AvatarPlaceholderType } from "@/types";

interface PlayerFormProps {
  initialName?: string;
  initialAvatar?: string;
  initialPlaceholderType?: AvatarPlaceholderType;
  onSubmit: (data: {
    name: string;
    avatarImage?: string;
    avatarFile?: File;
    avatarPlaceholderType: AvatarPlaceholderType;
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function PlayerForm({
  initialName = "",
  initialAvatar,
  initialPlaceholderType = "initials",
  onSubmit,
  onCancel,
  submitLabel = "Add Player",
}: PlayerFormProps) {
  const [name, setName] = useState(initialName);
  const [avatarImage, setAvatarImage] = useState<string | undefined>(
    initialAvatar
  );
  const [placeholderType, setPlaceholderType] =
    useState<AvatarPlaceholderType>(initialPlaceholderType);
  const [isCompressing, setIsCompressing] = useState(false);
  const [rawFile, setRawFile] = useState<File | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const compressed = await compressAvatar(file);
      setAvatarImage(compressed);
      setRawFile(file);
    } catch {
      // ignore compression errors
    }
    setIsCompressing(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      avatarImage,
      avatarFile: rawFile,
      avatarPlaceholderType: placeholderType,
    });
    setName("");
    setAvatarImage(undefined);
    setRawFile(undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="relative group">
          <Avatar
            name={name || "?"}
            image={avatarImage}
            placeholderType={placeholderType}
            size="lg"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
          {avatarImage && (
            <button
              type="button"
              onClick={() => setAvatarImage(undefined)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="player-name">Player Name</Label>
          <Input
            id="player-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter player name..."
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Label className="text-xs text-muted-foreground">Placeholder style:</Label>
        {(["initials", "neutral", "male", "female"] as AvatarPlaceholderType[]).map(
          (type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPlaceholderType(type)}
              className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                placeholderType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {type}
            </button>
          )
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={!name.trim() || isCompressing}>
          {isCompressing ? "Compressing..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
