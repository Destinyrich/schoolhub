"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

type Chapter = {
  id: string;
  title: string;
  order: number;
  contentType: string;
  contentHtml: string | null;
  fileUrl: string | null;
  isFreePreview: boolean;
};

type Book = {
  id: string;
  title: string;
  description: string | null;
  isFree: boolean;
  priceOverride: number | null;
  published: boolean;
  coverImage: string | null;
  chapters: Chapter[];
};

export default function EditBookPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingBook, setSavingBook] = useState(false);

  // New chapter form state
  const [chTitle, setChTitle] = useState("");
  const [chType, setChType] = useState<"text" | "file">("text");
  const [chHtml, setChHtml] = useState("");
  const [chFile, setChFile] = useState<File | null>(null);
  const [chFreePreview, setChFreePreview] = useState(false);
  const [addingChapter, setAddingChapter] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/books/${id}`);
    const data = await res.json();
    setBook(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateBookField(field: string, value: any) {
    if (!book) return;
    setSavingBook(true);
    const res = await fetch(`/api/admin/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    const updated = await res.json();
    setBook((prev) => (prev ? { ...prev, ...updated } : prev));
    setSavingBook(false);
  }

  async function handleAddChapter(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!chTitle.trim()) {
      setError("Chapter title is required.");
      return;
    }
    setAddingChapter(true);
    try {
      let fileUrl: string | undefined;
      if (chType === "file") {
        if (!chFile) throw new Error("Choose a PDF file to upload.");
        const fd = new FormData();
        fd.append("file", chFile);
        const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "Upload failed");
        fileUrl = upData.url;
      }

      const res = await fetch("/api/admin/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: id,
          title: chTitle,
          order: (book?.chapters.length || 0) + 1,
          contentType: chType,
          contentHtml: chType === "text" ? chHtml : undefined,
          fileUrl,
          isFreePreview: chFreePreview,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add chapter");

      setChTitle("");
      setChHtml("");
      setChFile(null);
      setChFreePreview(false);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingChapter(false);
    }
  }

  async function toggleChapterPreview(chapterId: string, value: boolean) {
    await fetch(`/api/admin/chapters/${chapterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFreePreview: value }),
    });
    await load();
  }

  async function deleteChapter(chapterId: string) {
    if (!confirm("Delete this chapter? This cannot be undone.")) return;
    await fetch(`/api/admin/chapters/${chapterId}`, { method: "DELETE" });
    await load();
  }

  async function deleteBook() {
    if (!confirm("Delete this entire book and all its chapters?")) return;
    await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
    router.push("/admin/books");
  }

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (!book) return <p className="text-red-600">Book not found.</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold">{book.title}</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => updateBookField("published", !book.published)}
            disabled={savingBook}
            className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
              book.published ? "bg-brand-100 text-brand-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {book.published ? "Published (click to unpublish)" : "Draft (click to publish)"}
          </button>
          <button onClick={deleteBook} className="text-sm font-semibold text-red-600 hover:underline">
            Delete book
          </button>
        </div>
      </div>

      {/* Book details */}
      <div className="bg-white border rounded-xl p-5 mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            defaultValue={book.title}
            onBlur={(e) => e.target.value !== book.title && updateBookField("title", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            defaultValue={book.description || ""}
            onBlur={(e) => updateBookField("description", e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={book.isFree}
            onChange={(e) => updateBookField("isFree", e.target.checked)}
          />
          <label className="text-sm font-medium">Entire book is free</label>
        </div>
        {!book.isFree && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Custom price in ₦ (blank = use site default fee)
            </label>
            <input
              type="number"
              min={0}
              defaultValue={book.priceOverride != null ? book.priceOverride / 100 : ""}
              onBlur={(e) =>
                updateBookField(
                  "priceOverride",
                  e.target.value ? Number(e.target.value) * 100 : null
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>

      {/* Chapters */}
      <h2 className="text-lg font-bold mb-3">Chapters ({book.chapters.length})</h2>
      <div className="bg-white border rounded-xl divide-y mb-6">
        {book.chapters.map((ch, i) => (
          <div key={ch.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400">
                Chapter {i + 1} • {ch.contentType === "file" ? "PDF" : "Text"}
              </p>
              <p className="font-medium">{ch.title}</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={ch.isFreePreview}
                  onChange={(e) => toggleChapterPreview(ch.id, e.target.checked)}
                />
                Free preview
              </label>
              <button
                onClick={() => deleteChapter(ch.id)}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {book.chapters.length === 0 && (
          <p className="p-4 text-sm text-slate-500">No chapters yet — add your first one below.</p>
        )}
      </div>

      {/* Add chapter form */}
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-bold mb-3">Add a Chapter</h3>
        <form onSubmit={handleAddChapter} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Chapter title</label>
            <input
              value={chTitle}
              onChange={(e) => setChTitle(e.target.value)}
              placeholder="e.g. Chapter 1: Introduction to Cells"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content type</label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={chType === "text"}
                  onChange={() => setChType("text")}
                />
                Write text
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={chType === "file"}
                  onChange={() => setChType("file")}
                />
                Upload PDF
              </label>
            </div>
          </div>

          {chType === "text" ? (
            <div>
              <label className="block text-sm font-medium mb-1">Chapter content</label>
              <textarea
                value={chHtml}
                onChange={(e) => setChHtml(e.target.value)}
                rows={8}
                placeholder="Write the chapter content here. Basic HTML tags like <p>, <b>, <ul> are supported."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">PDF file</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setChFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={chFreePreview}
              onChange={(e) => setChFreePreview(e.target.checked)}
            />
            <label className="text-sm font-medium">
              Make this chapter a free preview (readable without payment)
            </label>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={addingChapter}
            className="rounded-lg bg-brand-600 text-white font-semibold px-4 py-2 text-sm hover:bg-brand-700 disabled:opacity-60"
          >
            {addingChapter ? "Adding…" : "Add Chapter"}
          </button>
        </form>
      </div>
    </div>
  );
}
