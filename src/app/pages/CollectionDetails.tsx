import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { ArrowLeft, Calendar, Heart, Images, MapPin, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { getCollectionById } from "../services/collections";
import type { Collection, Memory } from "../types/memoirium";
import { MemoryFormModal, type MemoryFormState } from "../components/MemoryFormModal";
import { createMemory, getMemoriesByCollection, uploadMemoryImage } from "../services/memories";

function formatEra(collection: Collection) {
  if (!collection.era_start && !collection.era_end) return "Era not set";

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));

  if (collection.era_start && collection.era_end) {
    return `${formatDate(collection.era_start)} - ${formatDate(collection.era_end)}`;
  }

  if (collection.era_start) {
    return `From ${formatDate(collection.era_start)}`;
  }

  return `Until ${formatDate(collection.era_end as string)}`;
}

export function CollectionDetails() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [memoriesLoading, setMemoriesLoading] = useState(false);
  const [error, setError] = useState("");
  const [memoriesError, setMemoriesError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const heroImage = useMemo(
    () => collection?.cover_image_url || "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1200&h=500&fit=crop",
    [collection?.cover_image_url],
  );

  useEffect(() => {
    const loadCollection = async () => {
      if (!id || !user) return;

      setIsLoading(true);
      setError("");

      try {
        const data = await getCollectionById(id);

        if (data.user_id !== user.id) {
          setError("This exhibition room does not belong to your museum.");
          setCollection(null);
          return;
        }

        setCollection(data);
        setMemoriesLoading(true);
        try {
          const roomMemories = await getMemoriesByCollection(data.id);
          setMemories(roomMemories);
        } catch (memoryLoadError) {
          setMemoriesError(memoryLoadError instanceof Error ? memoryLoadError.message : "Unable to load memories.");
        } finally {
          setMemoriesLoading(false);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load this exhibition room.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadCollection();
  }, [id, user]);

  const reloadMemories = async () => {
    if (!collection) return;
    setMemoriesLoading(true);
    setMemoriesError("");
    try {
      const data = await getMemoriesByCollection(collection.id);
      setMemories(data);
    } catch (loadError) {
      setMemoriesError(loadError instanceof Error ? loadError.message : "Unable to load memories.");
    } finally {
      setMemoriesLoading(false);
    }
  };

  const slugify = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "memory-artifact";

  const handleCreateMemory = async (form: MemoryFormState) => {
    if (!user || !collection) return;
    setIsSaving(true);
    setFormError("");
    setUploadStatus("");

    if (!form.title.trim() || !form.story.trim() || !form.memory_date) {
      setFormError("Title, story, and memory date are required.");
      setIsSaving(false);
      return;
    }

    try {
      let imageUrl: string | null = null;
      let imagePath: string | null = null;

      if (form.imageFile) {
        setUploadStatus("Uploading image to the memory archive...");
        const uploaded = await uploadMemoryImage(user.id, form.imageFile);
        imageUrl = uploaded.publicUrl;
        imagePath = uploaded.path;
      }

      await createMemory({
        user_id: user.id,
        collection_id: collection.id,
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
      await reloadMemories();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : "Unable to save this memory.");
    } finally {
      setUploadStatus("");
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} showSearch />

        <main className="flex-1 mt-16">
          {isLoading && (
            <div className="min-h-[70vh] flex items-center justify-center px-6">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                <p className="text-[var(--gold-primary)]">Opening exhibition room...</p>
              </div>
            </div>
          )}

          {!isLoading && error && (
            <div className="max-w-3xl mx-auto px-6 py-20">
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-8 text-center">
                <p className="mb-6 text-red-200">{error}</p>
                <Button variant="outline" onClick={() => navigate("/collections")}>
                  <ArrowLeft size={18} />
                  Back to Exhibition Rooms
                </Button>
              </div>
            </div>
          )}

          {!isLoading && collection && (
            <>
              <div className="relative h-96 overflow-hidden">
                <img src={heroImage} alt={collection.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/60 to-transparent" />

                <div className="absolute inset-0 flex items-end">
                  <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 pb-12">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/collections")}
                      className="mb-6"
                    >
                      <ArrowLeft size={18} />
                      Back to Exhibition Rooms
                    </Button>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="mb-4 flex flex-wrap gap-3">
                        <span className="px-3 py-1 bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] text-xs rounded-full border border-[var(--gold-primary)]/20">
                          {collection.is_public ? "Public Exhibition Room" : "Private Exhibition Room"}
                        </span>
                        {collection.mood && (
                          <span className="px-3 py-1 bg-[var(--surface-light)] text-[var(--text-secondary)] text-xs rounded-full">
                            {collection.mood}
                          </span>
                        )}
                      </div>
                      <h1 className="text-5xl mb-4 text-[var(--gold-primary)]">{collection.title}</h1>
                      <p className="text-lg text-[var(--text-secondary)] max-w-3xl mb-4 leading-relaxed">
                        {collection.description || "This room is ready for its story."}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                  <div className="lg:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
                    <h2 className="text-2xl mb-4 text-[var(--gold-primary)]">Curator Note</h2>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {collection.curator_note || "No curator note has been written for this exhibition room yet."}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1">Mood</p>
                      <div className="flex items-center gap-2 text-[var(--gold-primary)]">
                        <Heart size={16} />
                        <span>{collection.mood || "Unset"}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1">Era</p>
                      <div className="flex items-center gap-2 text-[var(--gold-primary)]">
                        <Calendar size={16} />
                        <span>{formatEra(collection)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1">Visibility</p>
                      <p className="text-[var(--text-primary)]">
                        {collection.is_public ? "Open to public museum visitors" : "Private to your museum"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl text-[var(--gold-primary)]">Artifact Gallery</h2>
                  <Button variant="primary" onClick={() => setModalOpen(true)}>
                    <Plus size={20} />
                    Add Artifact
                  </Button>
                </div>

                {memoriesLoading && (
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                    <p className="text-[var(--gold-primary)]">Arranging memory artifacts...</p>
                  </div>
                )}

                {!memoriesLoading && memoriesError && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-8 text-center">
                    <p className="mb-4 text-red-200">{memoriesError}</p>
                    <Button variant="outline" onClick={() => void reloadMemories()}>
                      Try Again
                    </Button>
                  </div>
                )}

                {!memoriesLoading && !memoriesError && memories.length === 0 && (
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
                    <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-[var(--gold-primary)]/10 flex items-center justify-center">
                      <Images size={28} className="text-[var(--gold-primary)]" />
                    </div>
                    <h3 className="text-3xl mb-3 text-[var(--gold-primary)]">
                      This exhibition room is waiting for its first memory.
                    </h3>
                    <p className="text-[var(--text-secondary)] mb-8">
                      Add the first artifact and begin shaping this room.
                    </p>
                    <Button variant="primary" onClick={() => setModalOpen(true)}>
                      <Plus size={20} />
                      Add First Artifact
                    </Button>
                  </div>
                )}

                {!memoriesLoading && !memoriesError && memories.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {memories.map((memory, index) => (
                      <motion.div
                        key={memory.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card hoverable onClick={() => navigate(`/memory/${memory.id}`)}>
                          <div className="aspect-[4/3] overflow-hidden bg-[var(--surface-light)]">
                            {memory.image_url ? (
                              <img
                                src={memory.image_url}
                                alt={memory.title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Images size={38} className="text-[var(--gold-primary)]/60" />
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            <h3 className="text-xl mb-3 text-[var(--text-primary)]">{memory.title}</h3>
                            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                              {memory.memory_date && (
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} />
                                  <span>{new Date(memory.memory_date).toLocaleDateString()}</span>
                                </div>
                              )}
                              {memory.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin size={14} />
                                  <span>{memory.location}</span>
                                </div>
                              )}
                              {memory.emotion && (
                                <div className="flex items-center gap-2 text-[var(--gold-primary)]">
                                  <Heart size={14} />
                                  <span>{memory.emotion}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <MemoryFormModal
        memory={null}
        isOpen={modalOpen}
        isSaving={isSaving}
        error={formError}
        uploadStatus={uploadStatus}
        onClose={() => setModalOpen(false)}
        onSave={handleCreateMemory}
      />
    </div>
  );
}
