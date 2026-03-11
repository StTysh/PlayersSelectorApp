import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const playerId = formData.get("playerId") as string | null;

  if (!file || !playerId) {
    return NextResponse.json({ error: "Missing file or playerId" }, { status: 400 });
  }

  // Validate playerId format (alphanumeric + hyphens only)
  if (!/^[a-zA-Z0-9_-]+$/.test(playerId)) {
    return NextResponse.json({ error: "Invalid playerId" }, { status: 400 });
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  // Limit file size to 2MB
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${playerId}.${ext}`;

  const avatarDir = path.join(process.cwd(), "public", "avatars");
  await mkdir(avatarDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(avatarDir, filename), buffer);

  return NextResponse.json({ url: `/avatars/${filename}?t=${Date.now()}` });
}
