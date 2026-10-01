"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";

type Settings = {
  siteName: string;
  defaultFeeKobo: number;
  currency: string;
  adsenseClientId: string;
  adsenseSlot: string;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [feeNaira, setFeeNaira] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((s: Settings) => {
        setSettings(s);
        setFeeNaira(String(s.defaultFeeKobo / 100));
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteName: settings.siteName,
        defaultFeeKobo: Math.round(Number(feeNaira) * 100),
        currency: settings.currency,
        adsenseClientId: settings.adsenseClientId,
        adsenseSlot: settings.adsenseSlot,
      }),
    });
    const updated = await res.json();
    setSettings(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!settings) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-extrabold mb-1">Fees & Settings</h1>
      <p className="text-slate-500 mb-6">
        This fee applies to every paid book that doesn't have its own custom price.
      </p>

      <form onSubmit={handleSave} className="bg-white border rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Default unlock fee (₦)</label>
          <input
            type="number"
            min={0}
            value={feeNaira}
            onChange={(e) => setFeeNaira(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-lg font-bold"
          />
          <p className="text-xs text-slate-400 mt-1">
            Change this anytime — it takes effect immediately for every book using the default fee.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Site name</label>
          <input
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Currency code</label>
          <input
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value.toUpperCase() })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            maxLength={3}
          />
        </div>

        <hr />

        <div>
          <label className="block text-sm font-medium mb-1">Google AdSense Client ID</label>
          <input
            value={settings.adsenseClientId}
            onChange={(e) => setSettings({ ...settings, adsenseClientId: e.target.value })}
            placeholder="ca-pub-xxxxxxxxxxxxxxxx"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Google AdSense Slot ID</label>
          <input
            value={settings.adsenseSlot}
            onChange={(e) => setSettings({ ...settings, adsenseSlot: e.target.value })}
            placeholder="1234567890"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <p className="text-xs text-slate-400">
          Leave AdSense fields blank until your account is approved — ad slots will show a quiet
          placeholder instead of breaking the layout.
        </p>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 text-white font-semibold px-4 py-2 text-sm hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
        {saved && <span className="ml-3 text-sm text-brand-600 font-medium">Saved ✓</span>}
      </form>
    </div>
  );
}
