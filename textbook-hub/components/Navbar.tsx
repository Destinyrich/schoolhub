import Link from "next/link";

export default function Navbar({ siteName }: { siteName: string }) {
  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-brand-700">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white text-base">
            📘
          </span>
          {siteName}
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-brand-600">
            Browse Books
          </Link>
          <Link href="/admin" className="hover:text-brand-600">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
