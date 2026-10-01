import Link from "next/link";
import Image from "next/image";
import { formatNaira } from "@/lib/settings";

export default function BookCard({
  id,
  title,
  subjectName,
  className,
  coverImage,
  isFree,
  priceKobo,
  currency,
}: {
  id: string;
  title: string;
  subjectName: string;
  className: string;
  coverImage: string | null;
  isFree: boolean;
  priceKobo: number;
  currency: string;
}) {
  return (
    <Link
      href={`/books/${id}`}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="relative aspect-[3/4] bg-brand-50">
        {coverImage ? (
          <Image src={coverImage} alt={title} fill className="object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-5xl">📖</div>
        )}
        <span
          className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${
            isFree ? "bg-brand-500 text-white" : "bg-white/90 text-ink"
          }`}
        >
          {isFree ? "Free" : formatNaira(priceKobo, currency)}
        </span>
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold text-brand-600">{className}</p>
        <h3 className="font-semibold text-sm leading-snug group-hover:text-brand-700">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{subjectName}</p>
      </div>
    </Link>
  );
}
