import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Edit3, Images, Plus, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
import type { Collection } from "../types/memoirium";
import {
  createCollection,
  deleteCollection,
  getUserCollections,
  updateCollection,
  type CollectionCreateInput,
} from "../services/collections";

type CollectionFormState = {
  title: string;
  description: string;
  curator_note: string;
  mood: string;
  era_start: string;
  era_end: string;
  is_public: boolean;
  cover_image_url: string;
};

const emptyForm: CollectionFormState = {
  title: "",
  description: "",
  curator_note: "",
  mood: "",
  era_start: "",
  era_end: "",
  is_public: false,
  cover_image_url: "",
};

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "exhibition-room"
  );
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function CollectionModal({
  collection,
  isOpen,
  isSaving,
  error,
  onClose,
  onSave,
}: {
  collection: Collection | null;
  isOpen: boolean;
  isSaving: boolean;
  error: string;
  onClose: () => void;
  onSave: (form: CollectionFormState) => Promise<void>;
}) {
  const [form, setForm] = useState<CollectionFormState>(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    setForm(
      collection
        ? {
            title: collection.title,
            description: collection.description,
            curator_note: collection.curator_note ?? "",
            mood: collection.mood ?? "",
            era_start: collection.era_start ?? "",
            era_end: collection.era_end ?? "",
            is_public: collection.is_public,
            cover_image_url: collection.cover_image_url ?? "",
          }
        : emptyForm,
    );
  }, [collection, isOpen]);

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
              {collection ? "Edit Exhibition Room" : "New Exhibition Room"}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Shape the room that will hold a chapter of your museum.
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
            <label className="block text-sm mb-2 text-[var(--text-primary)]">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-24 w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-[var(--text-primary)]">Curator Note</label>
            <textarea
              value={form.curator_note}
              onChange={(event) => setForm((current) => ({ ...current, curator_note: event.target.value }))}
              className="min-h-20 w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-[var(--text-primary)]">Mood</label>
              <input
                value={form.mood}
                onChange={(event) => setForm((current) => ({ ...current, mood: event.target.value }))}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
                placeholder="Nostalgia"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-[var(--text-primary)]">Cover Image URL</label>
              <input
                value={form.cover_image_url}
                onChange={(event) => setForm((current) => ({ ...current, cover_image_url: event.target.value }))}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-[var(--text-primary)]">Era Start</label>
              <input
                type="date"
                value={form.era_start}
                onChange={(event) => setForm((current) => ({ ...current, era_start: event.target.value }))}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-[var(--text-primary)]">Era End</label>
              <input
                type="date"
                value={form.era_end}
                onChange={(event) => setForm((current) => ({ ...current, era_end: event.target.value }))}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(event) => setForm((current) => ({ ...current, is_public: event.target.checked }))}
              className="h-4 w-4 accent-[var(--gold-primary)]"
            />
            Make this exhibition room public
          </label>

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
              {isSaving ? "Saving..." : "Save Exhibition Room"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function Collections() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const collectionCountLabel = useMemo(
    () => `${collections.length} exhibition room${collections.length === 1 ? "" : "s"}`,
    [collections.length],
  );

  const loadCollections = async () => {
    if (!user) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await getUserCollections(user.id);
      setCollections(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load exhibition rooms.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCollections();
  }, [user]);

  const openCreateModal = () => {
    setEditingCollection(null);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (collection: Collection) => {
    setEditingCollection(collection);
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async (form: CollectionFormState) => {
    if (!user) return;

    setIsSaving(true);
    setFormError("");

    const payload: CollectionCreateInput = {
      user_id: user.id,
      title: form.title.trim(),
      slug: slugify(form.title),
      description: form.description.trim(),
      curator_note: form.curator_note.trim() || null,
      mood: form.mood.trim() || null,
      era_start: form.era_start || null,
      era_end: form.era_end || null,
      is_public: form.is_public,
      cover_image_url: form.cover_image_url.trim() || null,
    };

    try {
      if (editingCollection) {
        const { user_id: _userId, ...updatePayload } = payload;
        await updateCollection(editingCollection.id, updatePayload);
      } else {
        await createCollection(payload);
      }

      setModalOpen(false);
      await loadCollections();
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save this exhibition room. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (collection: Collection) => {
    const confirmed = window.confirm(`Delete "${collection.title}"? This will remove the exhibition room.`);
    if (!confirmed) return;

    setDeletingId(collection.id);
    setError("");

    try {
      await deleteCollection(collection.id);
      await loadCollections();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete exhibition room.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} showSearch />

        <main className="flex-1 p-6 lg:p-8 mt-16">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
            >
              <div>
                <h1 className="text-4xl mb-2 text-[var(--gold-primary)]">Exhibition Rooms</h1>
                <p className="text-[var(--text-secondary)]">
                  Organize your memories into curated rooms of your personal museum.
                </p>
                {!isLoading && !error && (
                  <p className="mt-2 text-sm text-[var(--gold-primary)]">{collectionCountLabel}</p>
                )}
              </div>
              <Button variant="primary" onClick={openCreateModal}>
                <Plus size={20} />
                New Exhibition Room
              </Button>
            </motion.div>

            {isLoading && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                <p className="text-[var(--gold-primary)]">Preparing your exhibition rooms...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-8 text-center">
                <p className="mb-4 text-red-200">{error}</p>
                <Button variant="outline" onClick={() => void loadCollections()}>
                  Try Again
                </Button>
              </div>
            )}

            {!isLoading && !error && collections.length === 0 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
                <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-[var(--gold-primary)]/10 flex items-center justify-center">
                  <Images size={28} className="text-[var(--gold-primary)]" />
                </div>
                <h2 className="text-3xl mb-3 text-[var(--gold-primary)]">No exhibition rooms yet</h2>
                <p className="text-[var(--text-secondary)] mb-8">
                  Begin with the first room of your museum, then fill it with memories.
                </p>
                <Button variant="primary" onClick={openCreateModal}>
                  <Plus size={20} />
                  Create First Exhibition Room
                </Button>
              </div>
            )}

            {!isLoading && !error && collections.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collections.map((collection, index) => (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card hoverable onClick={() => navigate(`/collection/${collection.id}`)}>
                      <div className="aspect-video overflow-hidden relative bg-[var(--surface-light)]">
                        {collection.cover_image_url ? (
                          <img
                            src={collection.cover_image_url}
                            alt={collection.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Images size={42} className="text-[var(--gold-primary)]/60" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-2xl mb-1 text-white">{collection.title}</h3>
                          <p className="text-xs uppercase tracking-wider text-[var(--gold-secondary)]">
                            {collection.is_public ? "Public Room" : "Private Room"}
                          </p>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="mb-5 line-clamp-2 min-h-14 text-sm text-[var(--text-secondary)]">
                          {collection.description || "A quiet room waiting for its story."}
                        </p>
                        <div className="flex items-center justify-between text-sm mb-5">
                          <div className="flex items-center gap-2 text-[var(--gold-primary)]">
                            <Images size={16} />
                            <span>Exhibition Room</span>
                          </div>
                          <span className="text-[var(--text-secondary)]">
                            Updated {formatUpdatedAt(collection.updated_at)}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditModal(collection);
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-2 border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-primary)] hover:border-[var(--gold-primary)] hover:text-[var(--gold-primary)] transition-colors"
                          >
                            <Edit3 size={15} />
                            Edit
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDelete(collection);
                            }}
                            disabled={deletingId === collection.id}
                            className="flex-1 inline-flex items-center justify-center gap-2 border border-red-500/30 px-3 py-2 text-sm text-red-200 hover:border-red-400 transition-colors disabled:opacity-60"
                          >
                            <Trash2 size={15} />
                            {deletingId === collection.id ? "Deleting" : "Delete"}
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openCreateModal}
          className="fixed bottom-8 right-8 w-14 h-14 bg-[var(--gold-primary)] rounded-full flex items-center justify-center shadow-2xl hover:bg-[var(--gold-secondary)] transition-colors"
        >
          <Plus size={24} className="text-[#0F1115]" />
        </motion.button>
      </div>

      <CollectionModal
        collection={editingCollection}
        isOpen={modalOpen}
        isSaving={isSaving}
        error={formError}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
