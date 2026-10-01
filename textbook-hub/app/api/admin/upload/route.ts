import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Simple local-disk file storage — good enough for a low-budget launch.
// For production/scale, swap this for Cloudinary/S3 (same API shape: return a public URL).
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowed = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  const maxBytes = 25 * 1024 * 1024; // 25MB
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  await writeFile(path.join(uploadsDir, safeName), bytes);

  return NextResponse.json({ url: `/uploads/${safeName}` }, { status: 201 });
}
