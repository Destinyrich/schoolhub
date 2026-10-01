import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `${settings.siteName} — Textbooks for Primary & Secondary School`,
    description: "Affordable digital textbooks and notes for primary and secondary school students.",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar siteName={settings.siteName} />
        <main className="flex-1">{children}</main>
        <footer className="border-t bg-white py-8 mt-16 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} {settings.siteName}. Built for students, by design.
        </footer>
      </body>
    </html>
  );
}
