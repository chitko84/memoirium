import { useEffect } from "react";
import { Calendar, Eye, MapPin, Sparkles, X } from "lucide-react";
import { motion } from "motion/react";
import type { Memory } from "../types/memoirium";
import { Button } from "./Button";
import { generateCuratorNote } from "../services/curatorNotes";

function formatDate(value: string | null) {
  if (!value) return "Date unknown";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function storyPreview(story: string) {
  if (story.length <= 220) return story;
  return `${story.slice(0, 217)}...`;
}

type GuidedTourOverlayProps = {
  memory: Memory;
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onEnd: () => void;
  onViewFull: () => void;
};

export function GuidedTourOverlay({
  memory,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onEnd,
  onViewFull,
}: GuidedTourOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrevious();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNext();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onEnd();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEnd, onNext, onPrevious]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-[130] p-4 sm:p-6 pointer-events-none">
      <motion.aside
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto mx-auto max-w-5xl overflow-hidden rounded-lg border border-[var(--gold-primary)]/40 bg-[var(--surface)]/95 backdrop-blur"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.68)" }}
        aria-live="polite"
      >
        <div className="grid gap-0 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="relative min-h-44 bg-[var(--surface-light)]">
            {memory.image_url ? (
              <img src={memory.image_url} alt={memory.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-44 items-center justify-center">
                <Sparkles size={42} className="text-[var(--gold-primary)]/60" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute left-4 top-4 border border-[var(--gold-primary)]/35 bg-black/55 px-3 py-1 text-xs text-[var(--gold-secondary)]">
              {currentStep} / {totalSteps}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.32em] text-[var(--text-secondary)]">Guided Tour</p>
                <h2 className="text-3xl text-[var(--gold-primary)]">{memory.title}</h2>
              </div>
              <button
                type="button"
                onClick={onEnd}
                className="rounded-full border border-[var(--border)] p-2 text-[var(--text-secondary)] transition-colors hover:border-[var(--gold-primary)] hover:text-[var(--gold-primary)]"
                aria-label="End tour"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-2">
                <Calendar size={15} className="text-[var(--gold-primary)]" />
                {formatDate(memory.memory_date)}
              </span>
              {memory.emotion && (
                <span className="inline-flex items-center gap-2">
                  <Sparkles size={15} className="text-[var(--gold-primary)]" />
                  {memory.emotion}
                </span>
              )}
              {memory.location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin size={15} className="text-[var(--gold-primary)]" />
                  {memory.location}
                </span>
              )}
            </div>

            <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">{storyPreview(memory.story)}</p>

            <div className="mb-5 border-l border-[var(--gold-primary)]/45 pl-4">
              <p className="mb-1 text-xs uppercase tracking-[0.25em] text-[var(--gold-secondary)]">Curator's Note</p>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{generateCuratorNote(memory)}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={onPrevious} disabled={totalSteps <= 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={onNext} disabled={totalSteps <= 1}>
                Next
              </Button>
              <Button variant="primary" size="sm" onClick={onViewFull}>
                <Eye size={16} />
                View Full Artifact
              </Button>
              <Button variant="outline" size="sm" onClick={onEnd}>
                End Tour
              </Button>
            </div>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
