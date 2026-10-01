"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const links = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/books", label: "Books & Chapters", icon: "📚" },
  { href: "/admin/settings", label: "Fees & Settings", icon: "⚙️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-full md:w-60 shrink-0 bg-white border-r md:h-[calc(100vh-4rem)] md:sticky md:top-16">
      <nav className="p-4 flex flex-col gap-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                active ? "bg-brand-500 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t mt-auto text-xs text-slate-500">
        <p className="mb-2 truncate">{session?.user?.email}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="font-semibold text-red-600 hover:underline"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
