"use client";

import React from "react";
import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";
import type { AvatarPlaceholderType } from "@/types";

interface AvatarProps {
  name: string;
  image?: string;
  placeholderType?: AvatarPlaceholderType;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-16 h-[4.5rem] text-lg",
  md: "w-20 h-[5.5rem] text-xl",
  lg: "w-28 h-[8rem] text-2xl",
  xl: "w-40 h-[11rem] text-4xl",
  "2xl": "w-56 h-[16rem] text-6xl",
};

const iconSizes = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 72,
  "2xl": 96,
};

function MaleIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle cx="12" cy="8" r="4" />
      {/* Body / shoulders */}
      <path d="M5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" />
      {/* Short hair */}
      <path d="M8.5 5.5C9 3.5 10.5 2.5 12 2.5s3 1 3.5 3" />
    </svg>
  );
}

function FemaleIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle cx="12" cy="8" r="4" />
      {/* Body / shoulders (narrower, dress shape) */}
      <path d="M6 21v-1a6 6 0 0 1 6-6 6 6 0 0 1 6 6v1" />
      {/* Long hair */}
      <path d="M8 7c0-3 1.5-5 4-5s4 2 4 5" />
      <path d="M8 7c-1 1-1.5 3-1 5" />
      <path d="M16 7c1 1 1.5 3 1 5" />
    </svg>
  );
}

function NeutralIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle cx="12" cy="8" r="4" />
      {/* Body */}
      <path d="M5.5 21v-2a5.5 5.5 0 0 1 5.5-5.5h2a5.5 5.5 0 0 1 5.5 5.5v2" />
    </svg>
  );
}

const COLORS = [
  "bg-rose-500",
  "bg-pink-500",
  "bg-fuchsia-500",
  "bg-purple-500",
  "bg-violet-500",
  "bg-indigo-500",
  "bg-blue-500",
  "bg-sky-500",
  "bg-cyan-500",
  "bg-teal-500",
  "bg-emerald-500",
  "bg-green-500",
  "bg-lime-600",
  "bg-amber-500",
  "bg-orange-500",
  "bg-red-500",
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function Avatar({
  name,
  image,
  placeholderType = "initials",
  size = "md",
  className,
}: AvatarProps) {
  if (image) {
    return (
      <div
        className={cn(
          "relative rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-white/20",
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={image}
          alt={name}
          fill
          unoptimized
          sizes="(max-width: 768px) 96px, 224px"
          className="object-cover"
        />
      </div>
    );
  }

  if (placeholderType === "initials" || !placeholderType) {
    return (
      <div
        className={cn(
          "rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-white ring-2 ring-white/20",
          sizeClasses[size],
          getColorForName(name),
          className
        )}
      >
        {getInitials(name)}
      </div>
    );
  }

  const iconBgColor =
    placeholderType === "male"
      ? "bg-blue-600"
      : placeholderType === "female"
      ? "bg-pink-500"
      : "bg-slate-500";

  const IconComponent =
    placeholderType === "male"
      ? MaleIcon
      : placeholderType === "female"
      ? FemaleIcon
      : NeutralIcon;

  return (
    <div
      className={cn(
        "rounded-lg flex-shrink-0 flex items-center justify-center text-white ring-2 ring-white/20",
        sizeClasses[size],
        iconBgColor,
        className
      )}
    >
      <IconComponent size={iconSizes[size]} />
    </div>
  );
}
