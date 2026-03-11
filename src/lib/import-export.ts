import type { Player, Round, HistoryEntry } from "@/types";

async function imageUrlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function exportPlayersJSON(players: Player[]): Promise<string> {
  const playersWithEmbeddedAvatars = await Promise.all(
    players.map(async (p) => {
      if (p.avatarImage && !p.avatarImage.startsWith("data:")) {
        try {
          const base64 = await imageUrlToBase64(p.avatarImage);
          return { ...p, avatarImage: base64 };
        } catch {
          return p;
        }
      }
      return p;
    })
  );
  return JSON.stringify(playersWithEmbeddedAvatars, null, 2);
}

export function exportPlayersCSV(players: Player[]): string {
  const headers = "name,score,isActive,timesSelected,correctCount,wrongCount,noAnswerCount,firstCount,secondCount,thirdCount,tieCount";
  const rows = players.map(
    (p) =>
      `"${p.name.replace(/"/g, '""')}",${p.score},${p.isActive},${p.stats.timesSelected},${p.stats.correctCount},${p.stats.wrongCount},${p.stats.noAnswerCount},${p.stats.firstCount},${p.stats.secondCount},${p.stats.thirdCount},${p.stats.tieCount}`
  );
  return [headers, ...rows].join("\n");
}

export function importPlayersJSON(json: string): Partial<Player>[] {
  const data = JSON.parse(json);
  if (!Array.isArray(data)) throw new Error("Expected an array of players");
  return data.map((p: Record<string, unknown>) => {
    const result: Partial<Player> = {
      name: String(p.name || "Unnamed"),
      avatarImage: typeof p.avatarImage === "string" ? p.avatarImage : undefined,
      avatarPlaceholderType:
        typeof p.avatarPlaceholderType === "string" &&
        ["initials", "male", "female", "neutral"].includes(p.avatarPlaceholderType)
          ? (p.avatarPlaceholderType as Player["avatarPlaceholderType"])
          : undefined,
      isActive: p.isActive !== false,
      score: typeof p.score === "number" ? p.score : 0,
    };
    if (p.stats && typeof p.stats === "object") {
      const s = p.stats as Record<string, unknown>;
      result.stats = {
        timesSelected: typeof s.timesSelected === "number" ? s.timesSelected : 0,
        correctCount: typeof s.correctCount === "number" ? s.correctCount : 0,
        wrongCount: typeof s.wrongCount === "number" ? s.wrongCount : 0,
        noAnswerCount: typeof s.noAnswerCount === "number" ? s.noAnswerCount : 0,
        firstCount: typeof s.firstCount === "number" ? s.firstCount : 0,
        secondCount: typeof s.secondCount === "number" ? s.secondCount : 0,
        thirdCount: typeof s.thirdCount === "number" ? s.thirdCount : 0,
        tieCount: typeof s.tieCount === "number" ? s.tieCount : 0,
      };
    }
    return result;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function importPlayersCSV(csv: string): Partial<Player>[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  // Skip header row
  return lines.slice(1).map((line) => {
    const parts = parseCSVLine(line);
    return {
      name: parts[0] || "Unnamed",
      score: Number(parts[1]) || 0,
      isActive: parts[2] !== "false",
      stats: {
        timesSelected: Number(parts[3]) || 0,
        correctCount: Number(parts[4]) || 0,
        wrongCount: Number(parts[5]) || 0,
        noAnswerCount: Number(parts[6]) || 0,
        firstCount: Number(parts[7]) || 0,
        secondCount: Number(parts[8]) || 0,
        thirdCount: Number(parts[9]) || 0,
        tieCount: Number(parts[10]) || 0,
      },
    };
  });
}

export function exportHistoryJSON(rounds: Round[], history: HistoryEntry[]): string {
  return JSON.stringify({ rounds, history }, null, 2);
}

export function downloadFile(content: string, filename: string, mime = "application/json") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
