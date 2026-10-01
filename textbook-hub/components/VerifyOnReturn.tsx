"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyOnReturn({ reference }: { reference: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "done" | "error">("verifying");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        if (!res.ok) throw new Error();
        if (!cancelled) {
          setStatus("done");
          router.replace(window.location.pathname);
          router.refresh();
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reference, router]);

  if (status === "error") {
    return (
      <div className="mb-6 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
        We couldn't confirm your payment. If you were charged, contact support with reference{" "}
        <code>{reference}</code>.
      </div>
    );
  }

  if (status === "verifying") {
    return (
      <div className="mb-6 rounded-lg bg-amber-50 text-amber-700 text-sm px-4 py-3">
        Confirming your payment…
      </div>
    );
  }

  return null;
}
