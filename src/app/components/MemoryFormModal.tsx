import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./Button";
import type { Memory } from "../types/memoirium";

export type MemoryFormState = {
  title: string;
  story: string;
  memory_date: string;
  location: string;
  emotion: string;
  is_public: boolean;
  is_featured: boolean;
  imageFile: File | null;
};

const emptyForm: MemoryFormState = {
  title: "",
  story: "",
  memory_date: "",
  location: "",
  emotion: "",
  is_public: false,
  is_featured: false,
  imageFile: null,
};

export function MemoryFormModal({
  memory,
  isOpen,
  isSaving,
  error,
  uploadStatus,
  onClose,
  onSave,
}: {
  memory: Memory | null;
  isOpen: boolean;
  isSaving: boolean;
  error: string;
  uploadStatus?: string;
  onClose: () => void;
  onSave: (form: MemoryFormState) => Promise<void>;
}) {
  const [form, setForm] = useState<MemoryFormState>(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    setForm(
      memory
        ? {
            title: memory.title,
            story: memory.story,
            memory_date: memory.memory_date ?? "",
            location: memory.location ?? "",
            emotion: memory.emotion ?? "",
            is_public: memory.is_public,
            is_featured: memory.is_featured,
            imageFile: null,
          }
        : emptyForm,
    );
  }, [isOpen, memory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6"
        style={{ boxShadow: "0 16px 56px rgba(0, 0, 0, 0.55)" }}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl text-[var(--gold-primary)]">
              {memory ? "Edit Memory Artifact" : "New Memory Artifact"}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Preserve the image, feeling, and story behind this exhibit.
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--gold-primary)]">
            <X size={24} />
          </button>
        </div>

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            void onSave(form);
          }}
        >
          <div>
            <label className="block text-sm mb-2 text-[var(--text-primary)]">Title</label>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-[var(--text-primary)]">Story</label>
            <textarea
              value={form.story}
              onChange={(event) => setForm((current) => ({ ...current, story: event.target.value }))}
              className="min-h-36 w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-2 text-[var(--text-primary)]">Memory Date</label>
              <input
                type="date"
                value={form.memory_date}
                onChange={(event) => setForm((current) => ({ ...current, memory_date: event.target.value }))}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-[var(--text-primary)]">Location</label>
              <input
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-[var(--text-primary)]">Emotion</label>
              <input
                value={form.emotion}
                onChange={(event) => setForm((current) => ({ ...current, emotion: event.target.value }))}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
                placeholder="Nostalgia"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-[var(--text-primary)]">
              {memory?.image_url ? "Replace Image" : "Image"}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setForm((current) => ({ ...current, imageFile: event.target.files?.[0] ?? null }))
              }
              className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] file:mr-4 file:border-0 file:bg-[var(--gold-primary)] file:px-4 file:py-2 file:text-[#0F1115]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={form.is_public}
                onChange={(event) => setForm((current) => ({ ...current, is_public: event.target.checked }))}
                className="h-4 w-4 accent-[var(--gold-primary)]"
              />
              Public memory
            </label>
            <label className="flex items-center gap-3 text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(event) => setForm((current) => ({ ...current, is_featured: event.target.checked }))}
                className="h-4 w-4 accent-[var(--gold-primary)]"
              />
              Featured artifact
            </label>
          </div>

          {uploadStatus && (
            <div className="rounded-lg border border-[var(--gold-primary)]/30 bg-[var(--gold-primary)]/10 px-4 py-3 text-sm text-[var(--gold-secondary)]">
              {uploadStatus}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Memory"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
