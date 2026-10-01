import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { ACCESS_COOKIE_NAME, hasAccess, verifyAccessToken } from "@/lib/access";
import AdSlot from "@/components/AdSlot";

export default async function ChapterPage({
  params,
}: {
  params: { bookId: string; chapterId: string };
}) {
  const [settings, book] = await Promise.all([
    getSettings(),
    prisma.book.findUnique({
      where: { id: params.bookId },
      include: { chapters: { orderBy: { order: "asc" } } },
    }),
  ]);

  if (!book) return notFound();
  const chapterIndex = book.chapters.findIndex((c) => c.id === params.chapterId);
  const chapter = book.chapters[chapterIndex];
  if (!chapter) return notFound();

  const accessPayload = verifyAccessToken(cookies().get(ACCESS_COOKIE_NAME)?.value);
  const unlocked = book.isFree || hasAccess(accessPayload, book.id);
  const canRead = unlocked || chapter.isFreePreview;

  if (!canRead) {
    redirect(`/books/${book.id}`);
  }

  const prevChapter = book.chapters[chapterIndex - 1];
  const nextChapter = book.chapters[chapterIndex + 1];
  const nextLocked = nextChapter && !unlocked && !nextChapter.isFreePreview;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href={`/books/${book.id}`} className="text-sm text-brand-600 font-medium hover:underline">
        ← Back to {book.title}
      </Link>

      <h1 className="text-2xl font-extrabold mt-3 mb-6">{chapter.title}</h1>

      <AdSlot clientId={settings.adsenseClientId} slot={settings.adsenseSlot} className="mb-8" />

      {chapter.contentType === "file" && chapter.fileUrl ? (
        <div className="border rounded-xl overflow-hidden bg-white" style={{ height: "80vh" }}>
          <iframe src={chapter.fileUrl} className="w-full h-full" title={chapter.title} />
        </div>
      ) : (
        <article
          className="prose-chapter bg-white border rounded-xl p-6"
          dangerouslySetInnerHTML={{ __html: chapter.contentHtml || "" }}
        />
      )}

      <AdSlot clientId={settings.adsenseClientId} slot={settings.adsenseSlot} className="my-8" />

      <div className="flex items-center justify-between border-t pt-4 mt-4">
        {prevChapter ? (
          <Link
            href={`/books/${book.id}/chapters/${prevChapter.id}`}
            className="text-sm font-medium text-slate-600 hover:text-brand-700"
          >
            ← {prevChapter.title}
          </Link>
        ) : (
          <span />
        )}
        {nextChapter &&
          (nextLocked ? (
            <Link
              href={`/books/${book.id}`}
              className="text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              🔒 Unlock to continue →
            </Link>
          ) : (
            <Link
              href={`/books/${book.id}/chapters/${nextChapter.id}`}
              className="text-sm font-medium text-slate-600 hover:text-brand-700"
            >
              {nextChapter.title} →
            </Link>
          ))}
      </div>
    </div>
  );
}
