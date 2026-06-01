import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { ArrowLeft, Calendar, Edit3, Folder, Heart, Images, MapPin, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../auth/AuthContext";
import type { Collection, Memory } from "../types/memoirium";
import { getCollectionById } from "../services/collections";
import {
  deleteMemory,
  deleteMemoryImage,
  getMemoryById,
  updateMemory,
  uploadMemoryImage,
} from "../services/memories";
import { MemoryFormModal, type MemoryFormState } from "../components/MemoryFormModal";
import { generateCuratorNote } from "../services/curatorNotes";

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "memory-artifact"
  );
}

function formatDate(value: string | null) {
  if (!value) return "Date not set";

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function MemoryDetails() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [memory, setMemory] = useState<Memory | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const loadMemory = async () => {
    if (!id || !user) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await getMemoryById(id);

      if (data.user_id !== user.id) {
        setError("This memory artifact does not belong to your museum.");
        setMemory(null);
        return;
      }

      setMemory(data);

      if (data.collection_id) {
        try {
          const room = await getCollectionById(data.collection_id);
          setCollection(room.user_id === user.id ? room : null);
        } catch {
          setCollection(null);
        }
      } else {
        setCollection(null);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load this memory artifact.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMemory();
  }, [id, user]);

  const handleUpdate = async (form: MemoryFormState) => {
    if (!user || !memory) return;

    setIsSaving(true);
    setFormError("");
    setUploadStatus("");

    if (!form.title.trim() || !form.story.trim() || !form.memory_date) {
      setFormError("Title, story, and memory date are required.");
      setIsSaving(false);
      return;
    }

    try {
      let imageUrl = memory.image_url;
      let imagePath = memory.image_path;

      if (form.imageFile) {
        setUploadStatus("Replacing image in the memory archive...");
        const uploaded = await uploadMemoryImage(user.id, form.imageFile);
        imageUrl = uploaded.publicUrl;
        imagePath = uploaded.path;

        if (memory.image_path) {
          await deleteMemoryImage(memory.image_path);
        }
      }

      await updateMemory(memory.id, {
        title: form.title.trim(),
        slug: slugify(form.title),
        story: form.story.trim(),
        memory_date: form.memory_date,
        location: form.location.trim() || null,
        emotion: form.emotion.trim() || null,
        image_url: imageUrl,
        image_path: imagePath,
        is_public: form.is_public,
        is_featured: form.is_featured,
      });

      setModalOpen(false);
      await loadMemory();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : "Unable to update this memory.");
    } finally {
      setUploadStatus("");
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!memory) return;
    const confirmed = window.confirm(`Delete "${memory.title}"? This will remove the memory artifact.`);
    if (!confirmed) return;

    setIsDeleting(true);
    setError("");

    try {
      await deleteMemory(memory.id);
      if (memory.image_path) {
        await deleteMemoryImage(memory.image_path);
      }
      navigate(memory.collection_id ? `/collection/${memory.collection_id}` : "/collections", { replace: true });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this memory.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} showSearch />

        <main className="flex-1 mt-16">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-8">
              <ArrowLeft size={18} />
              Back
            </Button>

            {isLoading && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                <p className="text-[var(--gold-primary)]">Illuminating memory artifact...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-8 text-center">
                <p className="mb-6 text-red-200">{error}</p>
                <Button variant="outline" onClick={() => navigate("/collections")}>
                  Back to Exhibition Rooms
                </Button>
              </div>
            )}

            {!isLoading && memory && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div
                  className="relative aspect-video rounded-lg overflow-hidden bg-[var(--surface-light)]"
                  style={{ boxShadow: "0 8px 48px rgba(0, 0, 0, 0.5)" }}
                >
                  {memory.image_url ? (
                    <img src={memory.image_url} alt={memory.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Images size={54} className="text-[var(--gold-primary)]/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div>
                    <div className="mb-4 flex flex-wrap gap-3">
                      <span className="px-3 py-1 bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] text-xs rounded-full border border-[var(--gold-primary)]/20">
                        {memory.is_public ? "Public Memory" : "Private Memory"}
                      </span>
                      {memory.is_featured && (
                        <span className="px-3 py-1 bg-[var(--surface-light)] text-[var(--gold-secondary)] text-xs rounded-full">
                          Featured Artifact
                        </span>
                      )}
                    </div>
                    <h1 className="text-5xl mb-6 text-[var(--gold-primary)]">{memory.title}</h1>

                    <div className="flex flex-wrap gap-6 text-[var(--text-secondary)]">
                      <div className="flex items-center gap-2">
                        <Calendar size={20} />
                        <span>{formatDate(memory.memory_date)}</span>
                      </div>
                      {memory.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={20} />
                          <span>{memory.location}</span>
                        </div>
                      )}
                      {memory.emotion && (
                        <div className="flex items-center gap-2">
                          <Heart size={20} className="text-[var(--gold-primary)]" />
                          <span className="text-[var(--gold-primary)]">{memory.emotion}</span>
                        </div>
                      )}
                      {collection && (
                        <div className="flex items-center gap-2">
                          <Folder size={20} />
                          <button
                            onClick={() => navigate(`/collection/${collection.id}`)}
                            className="hover:text-[var(--gold-primary)] transition-colors"
                          >
                            {collection.title}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setModalOpen(true)}>
                      <Edit3 size={18} />
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => void handleDelete()} disabled={isDeleting}>
                      <Trash2 size={18} />
                      {isDeleting ? "Deleting" : "Delete"}
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--gold-primary)]/25 bg-[var(--surface)] p-6">
                  <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[var(--gold-secondary)]">Curator's Note</p>
                  <p className="text-lg leading-relaxed text-[var(--text-secondary)]">{generateCuratorNote(memory)}</p>
                </div>

                <div className="border-t border-[var(--border)] pt-8">
                  <h2 className="text-2xl mb-6 text-[var(--gold-primary)]">The Story</h2>
                  <div className="prose prose-invert max-w-none">
                    {memory.story.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      <MemoryFormModal
        memory={memory}
        isOpen={modalOpen}
        isSaving={isSaving}
        error={formError}
        uploadStatus={uploadStatus}
        onClose={() => setModalOpen(false)}
        onSave={handleUpdate}
      />
    </div>
  );
}
