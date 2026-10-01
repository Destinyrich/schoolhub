import { prisma } from "@/lib/prisma";

export type SiteSettings = {
  siteName: string;
  defaultFeeKobo: number;
  currency: string;
  adsenseClientId: string;
  adsenseSlot: string;
};

const DEFAULTS: SiteSettings = {
  siteName: "TextbookHub",
  defaultFeeKobo: 50000,
  currency: "NGN",
  adsenseClientId: "",
  adsenseSlot: "",
};

export async function getSettings(): Promise<SiteSettings> {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    siteName: map.siteName ?? DEFAULTS.siteName,
    defaultFeeKobo: map.defaultFeeKobo ? parseInt(map.defaultFeeKobo, 10) : DEFAULTS.defaultFeeKobo,
    currency: map.currency ?? DEFAULTS.currency,
    adsenseClientId: map.adsenseClientId ?? "",
    adsenseSlot: map.adsenseSlot ?? "",
  };
}

export async function updateSettings(partial: Partial<SiteSettings>) {
  const entries = Object.entries(partial).filter(([, v]) => v !== undefined);
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );
}

export function formatNaira(kobo: number, currency = "NGN") {
  const amount = kobo / 100;
  return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount);
}

// Resolve the actual price of a book: free, custom override, or global default.
export function resolveBookPriceKobo(book: { isFree: boolean; priceOverride: number | null }, settings: SiteSettings) {
  if (book.isFree) return 0;
  return book.priceOverride ?? settings.defaultFeeKobo;
}
