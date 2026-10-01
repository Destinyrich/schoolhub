import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
    include: { classLevel: true, subject: true, chapters: true },
  });
  return NextResponse.json(books);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, classLevelId, subjectId, isFree, priceOverride, coverImage } = body;

  if (!title || !classLevelId || !subjectId) {
    return NextResponse.json(
      { error: "title, classLevelId and subjectId are required" },
      { status: 400 }
    );
  }

  const created = await prisma.book.create({
    data: {
      title,
      description: description || null,
      classLevelId,
      subjectId,
      coverImage: coverImage || null,
      isFree: !!isFree,
      priceOverride: priceOverride != null ? Number(priceOverride) : null,
      published: false,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
