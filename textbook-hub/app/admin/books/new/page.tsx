"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ClassLevel = { id: string; name: string; section: string };
type Subject = { id: string; name: string; classLevelId: string };

export default function NewBookPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classLevelId, setClassLevelId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [priceOverride, setPriceOverride] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/classes")
      .then((r) => r.json())
      .then(setClasses);
  }, []);

  useEffect(() => {
    if (!classLevelId) {
      setSubjects([]);
      return;
    }
    fetch(`/api/admin/subjects?classLevelId=${classLevelId}`)
      .then((r) => r.json())
      .then(setSubjects);
  }, [classLevelId]);

  async function ensureSubject(): Promise<string> {
    if (subjectId) return subjectId;
    if (!newSubjectName.trim()) throw new Error("Choose or create a subject.");
    const res = await fetch("/api/admin/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSubjectName.trim(), classLevelId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create subject");
    return data.id;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!classLevelId || !title.trim()) {
      setError("Class and title are required.");
      return;
    }
    setSaving(true);
    try {
      const finalSubjectId = await ensureSubject();

      let coverImage: string | undefined;
      if (coverFile) {
        const fd = new FormData();
        fd.append("file", coverFile);
        const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "Cover upload failed");
        coverImage = upData.url;
      }

      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          classLevelId,
          subjectId: finalSubjectId,
          isFree,
          priceOverride: isFree || !priceOverride ? null : Number(priceOverride) * 100,
          coverImage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create book");
      router.push(`/admin/books/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-extrabold mb-6">Add a New Book</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. Basic Science for JSS1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Class</label>
            <select
              value={classLevelId}
              onChange={(e) => {
                setClassLevelId(e.target.value);
                setSubjectId("");
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={!classLevelId}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {classLevelId && (
          <div>
            <label className="block text-sm font-medium mb-1">Or create a new subject</label>
            <input
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="e.g. Mathematics"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Cover image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isFree"
            type="checkbox"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
          />
          <label htmlFor="isFree" className="text-sm font-medium">
            This book is entirely free
          </label>
        </div>

        {!isFree && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Custom price in ₦ (leave blank to use the site's default fee)
            </label>
            <input
              type="number"
              min={0}
              value={priceOverride}
              onChange={(e) => setPriceOverride(e.target.value)}
              placeholder="e.g. 500"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 text-white font-semibold px-4 py-2 text-sm hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Creating…" : "Create Book & Add Chapters"}
        </button>
      </form>
    </div>
  );
}
