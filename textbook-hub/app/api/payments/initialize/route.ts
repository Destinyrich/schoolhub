import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSettings, resolveBookPriceKobo } from "@/lib/settings";
import { initializePaystackTransaction } from "@/lib/paystack";

export async function POST(req: Request) {
  const body = await req.json();
  const { bookId, email } = body;

  if (!bookId || !email) {
    return NextResponse.json({ error: "bookId and email are required" }, { status: 400 });
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book || !book.published) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const settings = await getSettings();
  const amountKobo = resolveBookPriceKobo(book, settings);

  if (amountKobo <= 0) {
    return NextResponse.json({ error: "This book is free — no payment needed" }, { status: 400 });
  }

  const reference = `th_${bookId.slice(0, 8)}_${Date.now()}`;
  const origin = new URL(req.url).origin;

  await prisma.purchase.create({
    data: { bookId, email, amount: amountKobo, reference, status: "pending" },
  });

  const tx = await initializePaystackTransaction({
    email,
    amountKobo,
    reference,
    callbackUrl: `${origin}/books/${bookId}?verify=${reference}`,
    metadata: { bookId },
  });

  return NextResponse.json({ authorizationUrl: tx.authorization_url, reference });
}
