import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Calendar, FolderOpen, Images, MapPin, Plus, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useAuth } from "../auth/AuthContext";
import { getUserMemories } from "../services/memories";
import { groupMemoriesByLocation } from "../services/memoryMap";
import type { Memory } from "../types/memoirium";

function formatDate(value: string | null) {
  if (!value) return "Date not set";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function MemoryMap() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadMemories = async () => {
      if (!user) return;

      setIsLoading(true);
      setError("");

      try {
        setMemories(await getUserMemories(user.id));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load your memory map.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadMemories();
  }, [user]);

  const locationGroups = useMemo(() => groupMemoriesByLocation(memories), [memories]);

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} showSearch />

        <main className="flex-1 mt-16 overflow-hidden">
          <section className="relative px-6 lg:px-8 py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.14),transparent_36%)]" />
            <div className="relative max-w-7xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <div className="mb-4 inline-flex items-center gap-2 border border-[var(--gold-primary)]/25 bg-[var(--surface)] px-4 py-2 text-sm text-[var(--gold-secondary)]">
                  <MapPin size={16} />
                  Spatial Archive
                </div>
                <h1 className="text-5xl mb-3 text-[var(--gold-primary)]">Memory Map</h1>
                <p className="max-w-2xl text-lg text-[var(--text-secondary)]">
                  Explore your museum by the places where memories were made.
                </p>
              </motion.div>

              {isLoading && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                  <MapPin size={34} className="mx-auto mb-4 text-[var(--gold-primary)]" />
                  <p className="text-[var(--gold-primary)]">Charting memory locations...</p>
                </div>
              )}

              {!isLoading && error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-8 text-center">
                  <p className="mb-6 text-red-200">{error}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              )}

              {!isLoading && !error && locationGroups.length === 0 && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
                  <MapPin size={42} className="mx-auto mb-5 text-[var(--gold-primary)]" />
                  <h2 className="text-3xl mb-3 text-[var(--gold-primary)]">No mapped memories yet</h2>
                  <p className="mx-auto mb-8 max-w-2xl text-[var(--text-secondary)]">
                    Add locations to memory artifacts and this room will become a geographic index of your museum.
                  </p>
                  <Button variant="primary" onClick={() => navigate("/collections")}>
                    <Plus size={18} />
                    Add Memories With Location
                  </Button>
                </div>
              )}

              {!isLoading && !error && locationGroups.length > 0 && (
                <div className="grid gap-6 lg:grid-cols-2">
                  {locationGroups.map((group, index) => {
                    const isExpanded = expandedLocation === group.location;

                    return (
                      <motion.div
                        key={group.location}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setExpandedLocation(isExpanded ? null : group.location)}
                            className="block w-full p-6 text-left"
                          >
                            <div className="mb-5 flex items-start justify-between gap-4">
                              <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--gold-primary)]/35 bg-[var(--gold-primary)]/10">
                                  <MapPin size={24} className="text-[var(--gold-primary)]" />
                                </div>
                                <div>
                                  <h2 className="text-2xl text-[var(--gold-primary)]">{group.location}</h2>
                                  <p className="text-sm text-[var(--text-secondary)]">
                                    {group.memories.length} {group.memories.length === 1 ? "memory" : "memories"}
                                  </p>
                                </div>
                              </div>
                              <span className="border border-[var(--gold-primary)]/25 px-3 py-1 text-xs text-[var(--gold-secondary)]">
                                {isExpanded ? "Open" : "View"}
                              </span>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="border border-[var(--border)] bg-black/20 p-4">
                                <p className="mb-1 text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                                  Latest Artifact
                                </p>
                                <p className="text-[var(--text-primary)]">{group.latestMemory.title}</p>
                                <p className="mt-2 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                  <Calendar size={14} />
                                  {formatDate(group.latestMemory.memory_date)}
                                </p>
                              </div>
                              <div className="border border-[var(--border)] bg-black/20 p-4">
                                <p className="mb-2 text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                                  Emotions Found Here
                                </p>
                                {group.emotions.length === 0 ? (
                                  <p className="text-sm text-[var(--text-secondary)]">No emotions tagged yet.</p>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {group.emotions.map((emotion) => (
                                      <span
                                        key={emotion}
                                        className="inline-flex items-center gap-1 border border-[var(--gold-primary)]/25 bg-[var(--gold-primary)]/10 px-2 py-1 text-xs text-[var(--gold-primary)]"
                                      >
                                        <Sparkles size={12} />
                                        {emotion}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t border-[var(--border)] bg-black/20 p-5">
                              <div className="grid gap-3">
                                {group.memories.map((memory) => (
                                  <button
                                    key={memory.id}
                                    type="button"
                                    onClick={() => navigate(`/memory/${memory.id}`)}
                                    className="flex items-center gap-4 border border-[var(--border)] bg-[var(--surface)] p-3 text-left transition-colors hover:border-[var(--gold-primary)]"
                                  >
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden bg-[var(--surface-light)]">
                                      {memory.image_url ? (
                                        <img src={memory.image_url} alt={memory.title} className="h-full w-full object-cover" />
                                      ) : (
                                        <Images size={24} className="text-[var(--gold-primary)]/60" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h3 className="truncate text-[var(--text-primary)]">{memory.title}</h3>
                                      <p className="mt-1 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                        <Calendar size={13} />
                                        {formatDate(memory.memory_date)}
                                      </p>
                                    </div>
                                    <FolderOpen size={18} className="text-[var(--gold-primary)]" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
