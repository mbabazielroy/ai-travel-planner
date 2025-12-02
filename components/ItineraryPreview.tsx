"use client";

interface Props {
  itinerary: string;
  onSave?: () => Promise<void>;
  onCopy?: () => void;
  onRegenerate?: () => void;
  saving?: boolean;
  regenerating?: boolean;
  destination?: string;
}

export const ItineraryPreview = ({
  itinerary,
  onSave,
  onCopy,
  onRegenerate,
  saving,
  regenerating,
  destination,
}: Props) => {
  const exportPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(itinerary, 180);
    doc.text(lines, 10, 10);
    doc.save(`${destination ? destination + "-" : ""}itinerary.pdf`);
  };

  if (!itinerary) {
    return (
      <div className="glass rounded-3xl p-6 text-sm text-slate-300">
        Generated plans will appear here. Use the form to create a tailored
        itinerary with OpenAI.
      </div>
    );
  }

  return (
    <div className="glass flex flex-col gap-4 rounded-3xl p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            AI plan
          </p>
          <h3 className="text-xl font-semibold text-white">
            Your generated itinerary
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {onCopy ? (
            <button
              type="button"
              onClick={onCopy}
              className="rounded-xl border border-white/15 px-3 py-2 text-xs text-slate-200 transition hover:border-white/40 hover:bg-white/10"
            >
              Copy
            </button>
          ) : null}
          {destination ? (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                destination
              )}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/15 px-3 py-2 text-xs text-slate-200 transition hover:border-white/40 hover:bg-white/10"
            >
              View on Map
            </a>
          ) : null}
          <button
            type="button"
            onClick={exportPdf}
            className="rounded-xl border border-white/15 px-3 py-2 text-xs text-slate-200 transition hover:border-white/40 hover:bg-white/10"
          >
            Export PDF
          </button>
          {onRegenerate ? (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={regenerating}
              className="rounded-xl border border-white/15 px-3 py-2 text-xs text-slate-200 transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {regenerating ? "Regenerating..." : "Regenerate"}
            </button>
          ) : null}
          {onSave ? (
            <button
              type="button"
              disabled={saving}
              onClick={onSave}
              className="rounded-xl bg-gradient-to-r from-aqua to-iris px-3 py-2 text-xs font-semibold text-white shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save to trips"}
            </button>
          ) : null}
        </div>
      </div>
      <article className="prose prose-invert max-w-none text-sm leading-6 text-slate-200 prose-headings:text-white prose-strong:text-white">
        {itinerary.split("\n").map((line, index) => (
          <p key={`${line}-${index}`}>{line}</p>
        ))}
      </article>
    </div>
  );
};
