import Script from "next/script";

// Renders a Google AdSense unit when adsenseClientId is configured in Settings.
// Falls back to a quiet placeholder so the layout doesn't shift once ads are turned on.
export default function AdSlot({
  clientId,
  slot,
  className = "",
}: {
  clientId: string;
  slot: string;
  className?: string;
}) {
  if (!clientId) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-400 ${className}`}
        style={{ minHeight: 90 }}
      >
        Ad space
      </div>
    );
  }

  return (
    <div className={className}>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script id={`adsbygoogle-init-${slot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}
