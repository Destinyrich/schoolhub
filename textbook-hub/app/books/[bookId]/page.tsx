import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSettings, resolveBookPriceKobo, formatNaira } from "@/lib/settings";
import { ACCESS_COOKIE_NAME, hasAccess, verifyAccessToken } from "@/lib/access";
import AdSlot from "@/components/AdSlot";
import PaywallGate from "@/components/PaywallGate";
import VerifyOnReturn from "@/components/VerifyOnReturn";

export default async function BookPage({
  params,
  searchParams,
}: {
  params: { bookId: string };
  searchParams: { verify?: string };
}) {
  const [settings, book] = await Promise.all([
    getSettings(),
    prisma.book.findUnique({
      where: { id: params.bookId },
      include: { classLevel: true, subject: true, chapters: { orderBy: { order: "asc" } } },
    }),
  ]);

  if (!book || !book.published) return notFound();

  const priceKobo = resolveBookPriceKobo(book, settings);
  const accessPayload = verifyAccessToken(cookies().get(ACCESS_COOKIE_NAME)?.value);
  const unlocked = book.isFree || hasAccess(accessPayload, book.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {searchParams.verify && <VerifyOnReturn reference={searchParams.verify} />}

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="relative w-full sm:w-48 aspect-[3/4] rounded-xl overflow-hidden bg-brand-50 shrink-0">
          {book.coverImage ? (
            <Image src={book.coverImage} alt={book.title} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-6xl">📖</div>
          )}
        </div>
        <div>
          <p className="text-brand-600 font-semibold text-sm">
            {book.classLevel.name} • {book.subject.name}
          </p>
          <h1 className="text-2xl font-extrabold mt-1">{book.title}</h1>
          {book.description && <p className="text-slate-600 mt-3">{book.description}</p>}
          <p className="mt-4 text-sm font-semibold">
            {book.isFree ? (
              <span className="text-brand-600">Free to read</span>
            ) : unlocked ? (
              <span className="text-brand-600">✓ Unlocked</span>
            ) : (
              <span>{formatNaira(priceKobo, settings.currency)} to unlock full book</span>
            )}
          </p>
        </div>
      </div>

      <AdSlot clientId={settings.adsenseClientId} slot={settings.adsenseSlot} className="my-8" />

      <h2 className="text-lg font-bold mb-3">Chapters</h2>
      <div className="divide-y border rounded-xl bg-white overflow-hidden">
        {book.chapters.length === 0 && (
          <p className="p-4 text-slate-500 text-sm">No chapters uploaded yet.</p>
        )}
        {book.chapters.map((ch, i) => {
          const open = unlocked || ch.isFreePreview;
          return (
            <div key={ch.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-slate-400">Chapter {i + 1}</p>
                <p className="font-medium">{ch.title}</p>
              </div>
              {open ? (
                <Link
                  href={`/books/${book.id}/chapters/${ch.id}`}
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  Read →
                </Link>
              ) : (
                <span className="text-sm text-slate-400 flex items-center gap-1">🔒 Locked</span>
              )}
            </div>
          );
        })}
      </div>

      {!unlocked && !book.isFree && (
        <div className="mt-8">
          <PaywallGate bookId={book.id} priceLabel={formatNaira(priceKobo, settings.currency)} />
        </div>
      )}
    </div>
  );
}
