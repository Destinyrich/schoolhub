import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatNaira, getSettings, resolveBookPriceKobo } from "@/lib/settings";

export default async function AdminBooksPage() {
  const settings = await getSettings();
  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
    include: { classLevel: true, subject: true, chapters: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold">Books & Chapters</h1>
        <Link
          href="/admin/books/new"
          className="rounded-lg bg-brand-600 text-white font-semibold px-4 py-2 text-sm hover:bg-brand-700"
        >
          + Add Book
        </Link>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500 text-xs uppercase">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Class</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Chapters</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {books.map((b) => (
              <tr key={b.id}>
                <td className="p-3 font-medium">{b.title}</td>
                <td className="p-3">{b.classLevel.name}</td>
                <td className="p-3">{b.subject.name}</td>
                <td className="p-3">{b.chapters.length}</td>
                <td className="p-3">
                  {b.isFree ? "Free" : formatNaira(resolveBookPriceKobo(b, settings), settings.currency)}
                </td>
                <td className="p-3">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      b.published ? "bg-brand-100 text-brand-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {b.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/books/${b.id}`} className="text-brand-600 font-semibold hover:underline">
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No books yet. Click "Add Book" to create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
