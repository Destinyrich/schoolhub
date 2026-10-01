"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaywallGate({
  bookId,
  priceLabel,
}: {
  bookId: string;
  priceLabel: string;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      window.location.href = data.authorizationUrl;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
      <div className="text-3xl mb-2">🔒</div>
      <h3 className="font-bold text-lg">This book is locked</h3>
      <p className="text-slate-500 text-sm mt-1">
        Pay <span className="font-semibold text-ink">{priceLabel}</span> once to unlock every
        chapter of this book, permanently.
      </p>
      <form onSubmit={handleUnlock} className="mt-5 flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 text-white text-sm font-semibold px-4 py-2 hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Redirecting…" : `Pay ${priceLabel}`}
        </button>
      </form>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <p className="text-xs text-slate-400 mt-3">Secure payment powered by Paystack.</p>
    </div>
  );
}
