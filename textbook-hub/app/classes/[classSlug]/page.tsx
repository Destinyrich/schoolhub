import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings, resolveBookPriceKobo } from "@/lib/settings";
import BookCard from "@/components/BookCard";
import AdSlot from "@/components/AdSlot";

export default async function ClassPage({ params }: { params: { classSlug: string } }) {
  const settings = await getSettings();
  const classLevel = await prisma.classLevel.findUnique({
    where: { id: params.classSlug },
    include: {
      subjects: { orderBy: { name: "asc" } },
      books: {
        where: { published: true },
        include: { subject: true, classLevel: true },
        orderBy: { title: "asc" },
      },
    },
  });

  if (!classLevel) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <p className="text-brand-600 font-semibold text-sm">{classLevel.section}</p>
      <h1 className="text-2xl font-extrabold mb-6">{classLevel.name}</h1>

      <AdSlot clientId={settings.adsenseClientId} slot={settings.adsenseSlot} className="mb-8" />

      {classLevel.books.length === 0 ? (
        <p className="text-slate-500">No books have been published for this class yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {classLevel.books.map((b) => (
            <BookCard
              key={b.id}
              id={b.id}
              title={b.title}
              subjectName={b.subject.name}
              className={classLevel.name}
              coverImage={b.coverImage}
              isFree={b.isFree}
              priceKobo={resolveBookPriceKobo(b, settings)}
              currency={settings.currency}
            />
          ))}
        </div>
      )}
    </div>
  );
}
