import { prisma } from "@/lib/prisma";
import { formatNaira, getSettings } from "@/lib/settings";
import Link from "next/link";

export default async function AdminDashboard() {
  const settings = await getSettings();
  const [bookCount, chapterCount, purchases, publishedCount] = await Promise.all([
    prisma.book.count(),
    prisma.chapter.count(),
    prisma.purchase.findMany({ where: { status: "success" } }),
    prisma.book.count({ where: { published: true } }),
  ]);

  const totalRevenueKobo = purchases.reduce((sum, p) => sum + p.amount, 0);

  const cards = [
    { label: "Total Books", value: bookCount },
    { label: "Published Books", value: publishedCount },
    { label: "Total Chapters", value: chapterCount },
    { label: "Successful Purchases", value: purchases.length },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1">Dashboard</h1>
      <p className="text-slate-500 mb-6">A quick look at your library and earnings.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border rounded-xl p-4">
            <p className="text-2xl font-extrabold">{c.value}</p>
            <p className="text-xs text-slate-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-xl p-5 mb-8">
        <p className="text-sm text-slate-500">Total revenue from unlocked books</p>
        <p className="text-3xl font-extrabold text-brand-700 mt-1">
          {formatNaira(totalRevenueKobo, settings.currency)}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-5">
        <p className="text-sm text-slate-500 mb-1">Current default unlock fee</p>
        <p className="text-xl font-bold">{formatNaira(settings.defaultFeeKobo, settings.currency)}</p>
        <Link
          href="/admin/settings"
          className="inline-block mt-3 text-sm font-semibold text-brand-600 hover:underline"
        >
          Change fee →
        </Link>
      </div>

      <div className="mt-8">
        <Link
          href="/admin/books/new"
          className="inline-block rounded-lg bg-brand-600 text-white font-semibold px-4 py-2 text-sm hover:bg-brand-700"
        >
          + Add a new book
        </Link>
      </div>
    </div>
  );
}
