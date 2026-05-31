import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  Calendar,
  Eye,
  Film,
  Images,
  Landmark,
  MapPin,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { GuidedTourOverlay } from "../components/GuidedTourOverlay";
import { MuseumAudioControl } from "../components/MuseumAudioControl";
import { useAuth } from "../auth/AuthContext";
import { getUserMemories } from "../services/memories";
import { getUserCollections } from "../services/collections";
import type { Collection, Memory } from "../types/memoirium";
import { generateCuratorNote } from "../services/curatorNotes";

type SortMode = "newest" | "oldest";

function formatDate(value: string | null) {
  if (!value) return "Undated artifact";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getMemoryTime(memory: Memory) {
  return new Date(memory.memory_date ?? memory.created_at).getTime();
}

function getEmotionGlow(emotion: string | null) {
  const key = emotion?.toLowerCase() ?? "";

  if (key.includes("joy") || key.includes("wonder")) return "rgba(244, 228, 188, 0.36)";
  if (key.includes("love") || key.includes("gratitude")) return "rgba(255, 186, 186, 0.28)";
  if (key.includes("peace") || key.includes("serenity")) return "rgba(166, 217, 206, 0.26)";
  if (key.includes("adventure") || key.includes("freedom")) return "rgba(212, 175, 55, 0.32)";
  if (key.includes("nostalgia")) return "rgba(201, 169, 97, 0.32)";

  return "rgba(212, 175, 55, 0.26)";
}

function splitGalleryWalls(memories: Memory[]) {
  return memories.reduce(
    (acc, memory, index) => {
      acc[index % 2 === 0 ? "left" : "right"].push(memory);
      return acc;
    },
    { left: [] as Memory[], right: [] as Memory[] },
  );
}

function storyPreview(story: string) {
  if (story.length <= 260) return story;
  return `${story.slice(0, 257)}...`;
}

function AmbientParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, index) => (
        <span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-[var(--gold-primary)]/45"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${(index * 19) % 92}%`,
            animation: `memoiriumFloat ${6 + (index % 6)}s ease-in-out ${index * 0.2}s infinite alternate`,
            boxShadow: "0 0 14px rgba(212, 175, 55, 0.55)",
          }}
        />
      ))}
    </div>
  );
}

function ArtworkFrame({
  memory,
  side,
  index,
  onOpen,
  isTourActive = false,
}: {
  memory: Memory;
  side: "left" | "right";
  index: number;
  onOpen: () => void;
  isTourActive?: boolean;
}) {
  const rotation = side === "left" ? "rotateY(22deg)" : "rotateY(-22deg)";
  const glow = getEmotionGlow(memory.emotion);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -10, scale: 1.035 }}
      onClick={onOpen}
      data-tour-artifact={memory.id}
      className={`group block w-full text-left transition-all duration-300 ${
        isTourActive ? "ring-2 ring-[var(--gold-primary)] ring-offset-4 ring-offset-black" : ""
      }`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className="relative bg-[#0b0c10] border border-[var(--gold-primary)]/45 p-3 transition-all duration-300 group-hover:border-[var(--gold-primary)]"
        style={{
          transform: rotation,
          boxShadow: `0 26px 70px rgba(0,0,0,0.58), 0 0 38px ${glow}, inset 0 0 0 1px rgba(244,228,188,0.12)`,
        }}
      >
        <div className="absolute -top-12 left-1/2 h-24 w-32 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(244,228,188,0.34),transparent_65%)] blur-xl memoirium-spotlight" />
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-light)] border border-[var(--gold-primary)]/25">
          {memory.image_url ? (
            <img
              src={memory.image_url}
              alt={memory.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Images size={38} className="text-[var(--gold-primary)]/60" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/5" />
        </div>
        <div className="mx-auto mt-3 w-[88%] border border-[var(--gold-primary)]/25 bg-black/45 px-3 py-2 text-center">
          <h3 className="truncate text-sm text-[var(--gold-secondary)]">{memory.title}</h3>
          <div className="mt-1 flex items-center justify-center gap-1 text-xs text-[var(--text-secondary)]">
            <Calendar size={12} />
            <span>{formatDate(memory.memory_date)}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function MemoryPreviewOverlay({
  memory,
  collection,
  onClose,
  onViewFull,
}: {
  memory: Memory;
  collection?: Collection;
  onClose: () => void;
  onViewFull: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-5xl overflow-hidden rounded-lg border border-[var(--gold-primary)]/35 bg-[var(--surface)]"
        style={{ boxShadow: "0 30px 90px rgba(0,0,0,0.65)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-[var(--border)] bg-black/50 p-2 text-[var(--text-primary)] hover:text-[var(--gold-primary)]"
        >
          <X size={20} />
        </button>
        <div className="grid max-h-[86vh] overflow-y-auto lg:grid-cols-[1.12fr_0.88fr]">
          <div className="relative min-h-[320px] bg-[var(--surface-light)]">
            {memory.image_url ? (
              <img src={memory.image_url} alt={memory.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-[420px] items-center justify-center">
                <Images size={56} className="text-[var(--gold-primary)]/60" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <div className="absolute inset-4 border border-[var(--gold-primary)]/30" />
          </div>

          <div className="p-8">
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">
              Memory Artifact
            </p>
            <h2 className="text-4xl mb-5 text-[var(--gold-primary)]">{memory.title}</h2>

            <div className="mb-6 space-y-3 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[var(--gold-primary)]" />
                <span>{formatDate(memory.memory_date)}</span>
              </div>
              {memory.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[var(--gold-primary)]" />
                  <span>{memory.location}</span>
                </div>
              )}
              {memory.emotion && (
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[var(--gold-primary)]" />
                  <span>{memory.emotion}</span>
                </div>
              )}
              {collection && (
                <div className="flex items-center gap-2">
                  <Landmark size={16} className="text-[var(--gold-primary)]" />
                  <span>{collection.title}</span>
                </div>
              )}
            </div>

            <p className="mb-8 text-[var(--text-secondary)] leading-relaxed">{storyPreview(memory.story)}</p>

            <div className="mb-8 border-l border-[var(--gold-primary)]/45 pl-4">
              <p className="mb-2 text-xs uppercase tracking-[0.28em] text-[var(--gold-secondary)]">Curator's Note</p>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{generateCuratorNote(memory)}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="primary" onClick={onViewFull}>
                <Eye size={18} />
                View Full Artifact
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function Gallery() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [cinematicMode, setCinematicMode] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [emotionFilter, setEmotionFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [focusedMemory, setFocusedMemory] = useState<Memory | null>(null);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadGallery = async () => {
      if (!user) return;

      setIsLoading(true);
      setError("");

      try {
        const [memoryData, collectionData] = await Promise.all([
          getUserMemories(user.id),
          getUserCollections(user.id),
        ]);
        setMemories(memoryData);
        setCollections(collectionData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to open the museum gallery.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadGallery();
  }, [user]);

  const emotions = useMemo(
    () =>
      Array.from(new Set(memories.map((memory) => memory.emotion).filter(Boolean) as string[])).sort((a, b) =>
        a.localeCompare(b),
      ),
    [memories],
  );

  const filteredMemories = useMemo(() => {
    return memories
      .filter((memory) => emotionFilter === "all" || memory.emotion === emotionFilter)
      .filter((memory) => collectionFilter === "all" || memory.collection_id === collectionFilter)
      .sort((a, b) => (sortMode === "newest" ? getMemoryTime(b) - getMemoryTime(a) : getMemoryTime(a) - getMemoryTime(b)));
  }, [collectionFilter, emotionFilter, memories, sortMode]);

  const walls = useMemo(() => splitGalleryWalls(filteredMemories), [filteredMemories]);
  const focusedCollection = focusedMemory?.collection_id
    ? collections.find((collection) => collection.id === focusedMemory.collection_id)
    : undefined;
  const tourMemory = tourIndex === null ? null : filteredMemories[tourIndex] ?? null;

  const showCorridor = hasEntered && !isLoading && !error && memories.length > 0;

  useEffect(() => {
    if (tourIndex === null) return;

    if (filteredMemories.length === 0) {
      setTourIndex(null);
      return;
    }

    if (tourIndex > filteredMemories.length - 1) {
      setTourIndex(filteredMemories.length - 1);
    }
  }, [filteredMemories, tourIndex]);

  useEffect(() => {
    if (!tourMemory) return;

    const visibleArtifact = Array.from(
      document.querySelectorAll<HTMLElement>(`[data-tour-artifact="${tourMemory.id}"]`),
    ).find((element) => element.offsetParent !== null);

    visibleArtifact?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [tourMemory]);

  const startGuidedTour = () => {
    if (filteredMemories.length === 0) return;

    setHasEntered(true);
    setTourIndex(0);
  };

  const goToPreviousTourMemory = () => {
    setTourIndex((current) => {
      if (current === null || filteredMemories.length === 0) return current;
      return current === 0 ? filteredMemories.length - 1 : current - 1;
    });
  };

  const goToNextTourMemory = () => {
    setTourIndex((current) => {
      if (current === null || filteredMemories.length === 0) return current;
      return current === filteredMemories.length - 1 ? 0 : current + 1;
    });
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {!cinematicMode && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col">
        {!cinematicMode && <Navbar onMenuClick={() => setSidebarOpen(true)} showSearch />}

        <main className={`${cinematicMode ? "mt-0" : "mt-16"} flex-1 overflow-hidden`}>
          <style>{`
            @keyframes memoiriumFloat {
              from { transform: translate3d(0, 0, 0); opacity: 0.26; }
              to { transform: translate3d(18px, -32px, 0); opacity: 0.75; }
            }

            @keyframes memoiriumSpotlight {
              0%, 100% { opacity: 0.42; transform: translateX(-50%) scale(1); }
              50% { opacity: 0.78; transform: translateX(-50%) scale(1.14); }
            }

            .memoirium-spotlight {
              animation: memoiriumSpotlight 5s ease-in-out infinite;
            }
          `}</style>

          <section className="px-6 lg:px-8 pt-10 pb-8">
            <div className="max-w-7xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-4 inline-flex items-center gap-2 border border-[var(--gold-primary)]/25 bg-[var(--surface)] px-4 py-2 text-sm text-[var(--gold-secondary)]">
                  <Sparkles size={16} />
                  Immersive Archive
                </div>
                <h1 className="text-5xl mb-3 text-[var(--gold-primary)]">Museum Gallery</h1>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <p className="text-lg text-[var(--text-secondary)]">
                    Walk through your memories as curated artifacts.
                  </p>
                  <MuseumAudioControl />
                </div>
              </motion.div>
            </div>
          </section>

          {isLoading && (
            <div className="mx-auto max-w-4xl px-6 py-16">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                <Landmark size={36} className="mx-auto mb-4 text-[var(--gold-primary)]" />
                <p className="text-[var(--gold-primary)]">Lighting the gallery corridor...</p>
              </div>
            </div>
          )}

          {!isLoading && error && (
            <div className="mx-auto max-w-4xl px-6 py-16">
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-8 text-center">
                <p className="mb-6 text-red-200">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !error && memories.length === 0 && (
            <div className="mx-auto max-w-4xl px-6 py-16">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
                <Images size={40} className="mx-auto mb-5 text-[var(--gold-primary)]" />
                <h2 className="text-3xl mb-3 text-[var(--gold-primary)]">No artifacts in the gallery yet</h2>
                <p className="text-[var(--text-secondary)] mb-8">
                  Create an exhibition room and add the first memory to begin the hallway.
                </p>
                <Button variant="primary" onClick={() => navigate("/collections")}>
                  <Plus size={18} />
                  Create First Memory
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !error && memories.length > 0 && !hasEntered && (
            <section className="px-6 lg:px-8 pb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative mx-auto max-w-6xl overflow-hidden border border-[var(--gold-primary)]/25 bg-[#07080b] px-8 py-20 text-center"
                style={{ boxShadow: "0 30px 90px rgba(0,0,0,0.55)" }}
              >
                <AmbientParticles />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(212,175,55,0.22),transparent_30%),linear-gradient(90deg,rgba(212,175,55,0.08),transparent,rgba(212,175,55,0.08))]" />
                <div className="relative z-10">
                  <Landmark size={48} className="mx-auto mb-6 text-[var(--gold-primary)]" />
                  <h2 className="text-5xl mb-5 text-[var(--gold-primary)]">Enter Gallery</h2>
                  <p className="mx-auto mb-8 max-w-2xl text-lg text-[var(--text-secondary)]">
                    Step into a cinematic corridor where each memory is framed as an artifact in your private museum.
                  </p>
                  <Button variant="primary" size="lg" onClick={() => setHasEntered(true)}>
                    <Film size={20} />
                    Enter Gallery
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={startGuidedTour}
                    className="ml-0 mt-3 sm:ml-3 sm:mt-0"
                    disabled={filteredMemories.length === 0}
                  >
                    <Sparkles size={20} />
                    Start Guided Tour
                  </Button>
                </div>
              </motion.div>
            </section>
          )}

          {showCorridor && (
            <>
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="px-6 lg:px-8 pb-8"
              >
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      value={emotionFilter}
                      onChange={(event) => setEmotionFilter(event.target.value)}
                      className="px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                    >
                      <option value="all">All emotions</option>
                      {emotions.map((emotion) => (
                        <option key={emotion} value={emotion}>
                          {emotion}
                        </option>
                      ))}
                    </select>
                    <select
                      value={collectionFilter}
                      onChange={(event) => setCollectionFilter(event.target.value)}
                      className="px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                    >
                      <option value="all">All exhibition rooms</option>
                      {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.title}
                        </option>
                      ))}
                    </select>
                    <select
                      value={sortMode}
                      onChange={(event) => setSortMode(event.target.value as SortMode)}
                      className="px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                    </select>
                  </div>
                  <Button variant={cinematicMode ? "primary" : "outline"} onClick={() => setCinematicMode((current) => !current)}>
                    <Film size={18} />
                    {cinematicMode ? "Exit Cinematic" : "Cinematic Mode"}
                  </Button>
                  <Button variant="primary" onClick={startGuidedTour} disabled={filteredMemories.length === 0}>
                    <Sparkles size={18} />
                    Start Guided Tour
                  </Button>
                </div>
              </motion.section>

              {filteredMemories.length === 0 ? (
                <div className="mx-auto max-w-4xl px-6 py-12">
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                    <Images size={34} className="mx-auto mb-4 text-[var(--gold-primary)]" />
                    <h2 className="text-3xl mb-3 text-[var(--gold-primary)]">No artifacts match these filters</h2>
                    <p className="text-[var(--text-secondary)]">Adjust the gallery controls to continue the walk.</p>
                  </div>
                </div>
              ) : (
                <>
                  <section className="hidden md:block px-6 lg:px-8 pb-20">
                    <div
                      className="relative mx-auto max-w-7xl min-h-[820px] overflow-hidden border border-[var(--gold-primary)]/15 bg-[#07080b]"
                      style={{
                        perspective: "1500px",
                        boxShadow: "0 34px 110px rgba(0,0,0,0.62)",
                      }}
                    >
                      <AmbientParticles />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(244,228,188,0.18),transparent_25%),radial-gradient(circle_at_50%_54%,rgba(212,175,55,0.10),transparent_30%)]" />
                      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[rgba(212,175,55,0.18)] to-transparent memoirium-spotlight" />
                      <div className="absolute left-1/2 top-0 h-full w-px bg-[var(--gold-primary)]/25" />
                      <div
                        className="absolute top-0 left-0 h-full w-[42%] bg-gradient-to-r from-black via-[rgba(212,175,55,0.05)] to-transparent"
                        style={{ clipPath: "polygon(0 0, 100% 14%, 70% 100%, 0 100%)" }}
                      />
                      <div
                        className="absolute top-0 right-0 h-full w-[42%] bg-gradient-to-l from-black via-[rgba(212,175,55,0.05)] to-transparent"
                        style={{ clipPath: "polygon(0 14%, 100% 0, 100% 100%, 30% 100%)" }}
                      />
                      <div
                        className="absolute bottom-0 left-1/2 h-[48%] w-[82%] -translate-x-1/2 bg-gradient-to-t from-black via-[rgba(212,175,55,0.10)] to-transparent"
                        style={{ clipPath: "polygon(2% 100%, 98% 100%, 58% 0, 42% 0)" }}
                      />
                      <div
                        className="absolute bottom-0 left-1/2 h-[40%] w-[66%] -translate-x-1/2 opacity-60"
                        style={{
                          clipPath: "polygon(8% 100%, 92% 100%, 56% 0, 44% 0)",
                          background: "linear-gradient(90deg, transparent, rgba(244,228,188,0.18), transparent)",
                          filter: "blur(12px)",
                        }}
                      />
                      <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.24),transparent_65%)] blur-2xl" />

                      <div className="relative z-10 grid grid-cols-[1fr_0.72fr_1fr] gap-8 px-10 py-16">
                        <div className="space-y-14">
                          {walls.left.map((memory, index) => (
                            <ArtworkFrame
                              key={memory.id}
                              memory={memory}
                              side="left"
                              index={index}
                              onOpen={() => setFocusedMemory(memory)}
                              isTourActive={tourMemory?.id === memory.id}
                            />
                          ))}
                        </div>

                        <div className="flex flex-col items-center justify-start pt-16">
                          <div className="h-48 w-28 border border-[var(--gold-primary)]/35 bg-black/30 shadow-2xl" />
                          <div className="mt-8 h-80 w-px bg-gradient-to-b from-[var(--gold-primary)]/55 to-transparent" />
                          <div className="mt-8 text-center">
                            <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">
                              Vanishing Point
                            </p>
                            <p className="mt-2 text-sm text-[var(--gold-secondary)]">
                              {filteredMemories.length} artifacts installed
                            </p>
                          </div>
                        </div>

                        <div className="space-y-14 pt-24">
                          {walls.right.map((memory, index) => (
                            <ArtworkFrame
                              key={memory.id}
                              memory={memory}
                              side="right"
                              index={index}
                              onOpen={() => setFocusedMemory(memory)}
                              isTourActive={tourMemory?.id === memory.id}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="md:hidden px-6 pb-14">
                    <div className="space-y-6">
                      {filteredMemories.map((memory, index) => (
                        <motion.button
                          key={memory.id}
                          type="button"
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setFocusedMemory(memory)}
                          data-tour-artifact={memory.id}
                          className={`block w-full border bg-[var(--surface)] p-3 text-left transition-all duration-300 ${
                            tourMemory?.id === memory.id
                              ? "border-[var(--gold-primary)] ring-2 ring-[var(--gold-primary)]"
                              : "border-[var(--gold-primary)]/30"
                          }`}
                          style={{ boxShadow: `0 0 30px ${getEmotionGlow(memory.emotion)}` }}
                        >
                          <div className="aspect-[4/3] overflow-hidden bg-[var(--surface-light)]">
                            {memory.image_url ? (
                              <img
                                src={memory.image_url}
                                alt={memory.title}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Images size={34} className="text-[var(--gold-primary)]/60" />
                              </div>
                            )}
                          </div>
                          <div className="border border-[var(--gold-primary)]/20 bg-black/30 px-3 py-3">
                            <h3 className="text-lg text-[var(--gold-secondary)]">{memory.title}</h3>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">{formatDate(memory.memory_date)}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </main>
      </div>

      {focusedMemory && (
        <MemoryPreviewOverlay
          memory={focusedMemory}
          collection={focusedCollection}
          onClose={() => setFocusedMemory(null)}
          onViewFull={() => navigate(`/memory/${focusedMemory.id}`)}
        />
      )}

      {tourMemory && (
        <GuidedTourOverlay
          memory={tourMemory}
          currentStep={tourIndex === null ? 1 : tourIndex + 1}
          totalSteps={filteredMemories.length}
          onPrevious={goToPreviousTourMemory}
          onNext={goToNextTourMemory}
          onEnd={() => setTourIndex(null)}
          onViewFull={() => navigate(`/memory/${tourMemory.id}`)}
        />
      )}
    </div>
  );
}
