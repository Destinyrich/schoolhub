import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { ACCESS_COOKIE_NAME, issueAccessToken, verifyAccessToken } from "@/lib/access";

export async function POST(req: Request) {
  const body = await req.json();
  const { reference } = body;
  if (!reference) {
    return NextResponse.json({ error: "reference is required" }, { status: 400 });
  }

  const purchase = await prisma.purchase.findUnique({ where: { reference } });
  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  // Already verified previously — just re-issue the access cookie.
  if (purchase.status === "success") {
    return grantAccessAndRespond(purchase.email, purchase.bookId);
  }

  const result = await verifyPaystackTransaction(reference);

  if (result.status !== "success") {
    await prisma.purchase.update({ where: { reference }, data: { status: "failed" } });
    return NextResponse.json({ error: "Payment not successful" }, { status: 402 });
  }

  await prisma.purchase.update({ where: { reference }, data: { status: "success" } });

  return grantAccessAndRespond(result.customer.email, purchase.bookId);
}

function grantAccessAndRespond(email: string, bookId: string) {
  const cookieStore = cookies();
  const existing = verifyAccessToken(cookieStore.get(ACCESS_COOKIE_NAME)?.value);
  const token = issueAccessToken(existing, email, bookId);

  const res = NextResponse.json({ ok: true, bookId });
  res.cookies.set(ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
  });
  return res;
}
