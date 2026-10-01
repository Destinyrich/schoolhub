export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings, resolveBookPriceKobo } from "@/lib/settings";
import BookCard from "@/components/BookCard";
import AdSlot from "@/components/AdSlot";

export default async function HomePage() {
  const settings = await getSettings();
  const [classes, recentBooks] = await Promise.all([
    prisma.classLevel.findMany({ orderBy: { order: "asc" } }),
    prisma.book.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { classLevel: true, subject: true },
    }),
  ]);

  const sections = [
    { label: "Primary School", section: "Primary" },
    { label: "Junior Secondary", section: "Junior Secondary" },
    { label: "Senior Secondary", section: "Senior Secondary" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-slate-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-ink">
            Every textbook your child needs, in one place.
          </h1>
          <p className="mt-3 text-slate-600 max-w-xl mx-auto">
            Browse notes and textbooks by class and subject. Read free previews, or unlock the
            full book for a small fee.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <AdSlot clientId={settings.adsenseClientId} slot={settings.adsenseSlot} className="mb-10" />

        {/* Browse by class group */}
        {sections.map((s) => {
          const group = classes.filter((c) => c.section === s.section);
          if (group.length === 0) return null;
          return (
            <div key={s.section} className="mb-10">
              <h2 className="text-lg font-bold mb-3">{s.label}</h2>
              <div className="flex flex-wrap gap-3">
                {group.map((c) => (
                  <Link
                    key={c.id}
                    href={`/classes/${c.id}`}
                    className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium hover:border-brand-500 hover:text-brand-700 transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* Recently added books */}
        {recentBooks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold mb-4">Recently Added</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {recentBooks.map((b) => (
                <BookCard
                  key={b.id}
                  id={b.id}
                  title={b.title}
                  subjectName={b.subject.name}
                  className={b.classLevel.name}
                  coverImage={b.coverImage}
                  isFree={b.isFree}
                  priceKobo={resolveBookPriceKobo(b, settings)}
                  currency={settings.currency}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
