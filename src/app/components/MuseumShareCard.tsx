import { Copy, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "./Button";

type MuseumShareCardProps = {
  museumTitle: string;
  displayName: string;
  museumTagline: string | null;
  publicMuseumUrl: string;
  publicRoomCount: number;
  publicMemoryCount: number;
};

export function MuseumShareCard({
  museumTitle,
  displayName,
  museumTagline,
  publicMuseumUrl,
  publicRoomCount,
  publicMemoryCount,
}: MuseumShareCardProps) {
  const [status, setStatus] = useState("");
  const shareText = useMemo(
    () => `Explore ${museumTitle} - a digital memory museum built with Memoirium: ${publicMuseumUrl}`,
    [museumTitle, publicMuseumUrl],
  );
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copyText = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(message);
    } catch {
      setStatus("Unable to copy in this browser.");
    }
  };

  const shareMuseum = async () => {
    if (!canShare) return;

    try {
      await navigator.share({
        title: museumTitle,
        text: shareText,
        url: publicMuseumUrl,
      });
      setStatus("Share sheet opened.");
    } catch {
      setStatus("Share canceled.");
    }
  };

  return (
    <div className="rounded-lg border border-[var(--gold-primary)]/30 bg-[var(--surface)] p-6">
      <div className="mb-5 flex items-center gap-2 text-sm text-[var(--gold-secondary)]">
        <Share2 size={16} />
        <span>Share Museum</span>
      </div>

      <div
        className="relative overflow-hidden rounded-lg border border-[var(--gold-primary)]/35 bg-[#07080b] p-6"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.45)" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.24),transparent_34%)]" />
        <div className="relative z-10">
          <p className="mb-3 text-xs uppercase tracking-[0.32em] text-[var(--text-secondary)]">Memoirium Public Museum</p>
          <h3 className="text-3xl text-[var(--gold-primary)]">{museumTitle}</h3>
          <p className="mt-2 text-[var(--text-secondary)]">Curated by {displayName}</p>
          <p className="mt-5 min-h-12 text-sm leading-relaxed text-[var(--gold-secondary)]">
            {museumTagline || "Every memory deserves a gallery."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="border border-[var(--gold-primary)]/25 bg-black/30 p-3">
              <p className="text-2xl text-[var(--gold-primary)]">{publicRoomCount}</p>
              <p className="text-xs text-[var(--text-secondary)]">Public Exhibition Rooms</p>
            </div>
            <div className="border border-[var(--gold-primary)]/25 bg-black/30 p-3">
              <p className="text-2xl text-[var(--gold-primary)]">{publicMemoryCount}</p>
              <p className="text-xs text-[var(--text-secondary)]">Public Artifacts</p>
            </div>
          </div>

          <p className="mt-5 break-all text-xs text-[var(--text-secondary)]">{publicMuseumUrl}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button variant="outline" onClick={() => void copyText(publicMuseumUrl, "Museum link copied.")}>
          <Copy size={18} />
          Copy Museum Link
        </Button>
        <Button variant="outline" onClick={() => void copyText(shareText, "Share text copied.")}>
          <Copy size={18} />
          Copy Share Text
        </Button>
        {canShare && (
          <Button variant="primary" className="sm:col-span-2" onClick={() => void shareMuseum()}>
            <Share2 size={18} />
            Share
          </Button>
        )}
      </div>

      {status && <p className="mt-3 text-sm text-[var(--gold-secondary)]">{status}</p>}
    </div>
  );
}
