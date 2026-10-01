import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { bookId, title, order, contentType, contentHtml, fileUrl, isFreePreview } = body;

  if (!bookId || !title) {
    return NextResponse.json({ error: "bookId and title are required" }, { status: 400 });
  }

  const created = await prisma.chapter.create({
    data: {
      bookId,
      title,
      order: order ?? 0,
      contentType: contentType || "text",
      contentHtml: contentHtml || null,
      fileUrl: fileUrl || null,
      isFreePreview: !!isFreePreview,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
