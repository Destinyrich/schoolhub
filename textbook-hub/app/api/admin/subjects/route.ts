import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classLevelId = searchParams.get("classLevelId") || undefined;
  const subjects = await prisma.subject.findMany({
    where: classLevelId ? { classLevelId } : undefined,
    orderBy: { name: "asc" },
  });
  return NextResponse.json(subjects);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, classLevelId } = body;
  if (!name || !classLevelId) {
    return NextResponse.json({ error: "name and classLevelId are required" }, { status: 400 });
  }
  const created = await prisma.subject.create({ data: { name, classLevelId } });
  return NextResponse.json(created, { status: 201 });
}
