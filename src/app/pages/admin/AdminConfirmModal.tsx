import { X } from "lucide-react";

export function AdminConfirmModal({
  title,
  message,
  confirmLabel,
  isProcessing,
  error,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  isProcessing: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-lg border border-[var(--gold-primary)]/35 bg-[var(--surface)] shadow-[0_30px_100px_rgba(0,0,0,0.72)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.28em] text-[var(--gold-secondary)]">Admin Confirmation</p>
            <h2 className="text-3xl text-[var(--gold-primary)]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-full border border-[var(--border)] p-2 text-[var(--text-secondary)] transition-colors hover:border-[var(--gold-primary)] hover:text-[var(--gold-primary)] disabled:opacity-60"
            aria-label="Close confirmation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <p className="leading-relaxed text-[var(--text-secondary)]">{message}</p>

          {error && (
            <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="border border-[var(--border)] px-5 py-3 text-[var(--text-primary)] transition-colors hover:border-[var(--gold-primary)] hover:text-[var(--gold-primary)] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isProcessing}
              className="border border-red-500/45 bg-red-500/10 px-5 py-3 text-red-100 transition-colors hover:bg-red-500/20 disabled:opacity-60"
            >
              {isProcessing ? "Deleting..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
