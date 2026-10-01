import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { title, order, contentType, contentHtml, fileUrl, isFreePreview } = body;

  const updated = await prisma.chapter.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(order !== undefined && { order }),
      ...(contentType !== undefined && { contentType }),
      ...(contentHtml !== undefined && { contentHtml }),
      ...(fileUrl !== undefined && { fileUrl }),
      ...(isFreePreview !== undefined && { isFreePreview }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.chapter.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
