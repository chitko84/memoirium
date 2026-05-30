import { Landmark } from "lucide-react";

export function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-6">
      <div className="text-center">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--gold-primary)]/40 bg-[var(--surface)]"
          style={{ boxShadow: "0 0 48px rgba(212, 175, 55, 0.18)" }}
        >
          <Landmark size={30} className="text-[var(--gold-primary)]" />
        </div>
        <h1 className="text-4xl tracking-wider text-[var(--gold-primary)]">MEMOIRIUM</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">Preparing the gallery...</p>
      </div>
    </div>
  );
}
