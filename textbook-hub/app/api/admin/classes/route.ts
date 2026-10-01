import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const classes = await prisma.classLevel.findMany({
    orderBy: { order: "asc" },
    include: { subjects: true },
  });
  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, section, order } = body;
  if (!name || !section) {
    return NextResponse.json({ error: "name and section are required" }, { status: 400 });
  }
  const created = await prisma.classLevel.create({
    data: { name, section, order: order ?? 0 },
  });
  return NextResponse.json(created, { status: 201 });
}
