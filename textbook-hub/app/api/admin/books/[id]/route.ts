import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: { chapters: { orderBy: { order: "asc" } }, classLevel: true, subject: true },
  });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(book);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const {
    title,
    description,
    classLevelId,
    subjectId,
    isFree,
    priceOverride,
    coverImage,
    published,
  } = body;

  const updated = await prisma.book.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(classLevelId !== undefined && { classLevelId }),
      ...(subjectId !== undefined && { subjectId }),
      ...(isFree !== undefined && { isFree }),
      ...(priceOverride !== undefined && {
        priceOverride: priceOverride === null ? null : Number(priceOverride),
      }),
      ...(coverImage !== undefined && { coverImage }),
      ...(published !== undefined && { published }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.book.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
