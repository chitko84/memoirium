import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Calendar, Heart, Images } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { getUserMemories } from "../services/memories";
import type { Memory } from "../types/memoirium";

function getMemoryDate(memory: Memory) {
  return memory.memory_date ? new Date(memory.memory_date) : new Date(memory.created_at);
}

function previewStory(story: string) {
  if (story.length <= 150) return story;
  return `${story.slice(0, 147)}...`;
}

export function Timeline() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadMemories = async () => {
      if (!user) return;

      setIsLoading(true);
      setError("");

      try {
        const data = await getUserMemories(user.id);
        setMemories(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load your memory timeline.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadMemories();
  }, [user]);

  const timelineData = useMemo(() => {
    const grouped = memories.reduce<Record<string, Memory[]>>((acc, memory) => {
      const year = getMemoryDate(memory).getFullYear().toString();
      acc[year] = acc[year] ?? [];
      acc[year].push(memory);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, yearMemories]) => ({
        year,
        memories: yearMemories.sort((a, b) => getMemoryDate(b).getTime() - getMemoryDate(a).getTime()),
      }));
  }, [memories]);

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} showSearch />

        <main className="flex-1 p-6 lg:p-8 mt-16">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <h1 className="text-4xl mb-2 text-[var(--gold-primary)]">Timeline</h1>
              <p className="text-[var(--text-secondary)]">Journey through your memories chronologically</p>
            </motion.div>

            {isLoading && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                <p className="text-[var(--gold-primary)]">Arranging your chronology...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-8 text-center">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {!isLoading && !error && memories.length === 0 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
                <Images size={34} className="mx-auto mb-4 text-[var(--gold-primary)]" />
                <h2 className="text-3xl mb-3 text-[var(--gold-primary)]">No timeline entries yet</h2>
                <p className="text-[var(--text-secondary)]">
                  Add memories to exhibition rooms and they will appear here by date.
                </p>
              </div>
            )}

            {!isLoading && !error && memories.length > 0 && (
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--gold-primary)] via-[var(--gold-primary)]/50 to-transparent" />

                {timelineData.map((yearGroup, yearIndex) => (
                  <motion.div
                    key={yearGroup.year}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: yearIndex * 0.1 }}
                    className="mb-16"
                  >
                    <div className="flex items-center gap-6 mb-8">
                      <div
                        className="w-16 h-16 bg-[var(--gold-primary)] rounded-full flex items-center justify-center relative z-10"
                        style={{ boxShadow: "0 0 32px rgba(212, 175, 55, 0.3)" }}
                      >
                        <span className="text-2xl text-[#0F1115]">{yearGroup.year}</span>
                      </div>
                      <div className="flex-1 h-px bg-[var(--border)]" />
                    </div>

                    <div className="space-y-8 ml-0 md:ml-32">
                      {yearGroup.memories.map((memory, memoryIndex) => {
                        const date = getMemoryDate(memory);
                        return (
                          <motion.div
                            key={memory.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: yearIndex * 0.1 + memoryIndex * 0.05 }}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden hover:border-[var(--gold-primary)] transition-all duration-300 cursor-pointer"
                            onClick={() => navigate(`/memory/${memory.id}`)}
                            style={{ boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)" }}
                          >
                            <div className="flex flex-col md:flex-row gap-6 p-6">
                              <div className="flex-shrink-0">
                                <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-[var(--surface-light)]">
                                  {memory.image_url ? (
                                    <img
                                      src={memory.image_url}
                                      alt={memory.title}
                                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Images size={30} className="text-[var(--gold-primary)]/60" />
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                    <Calendar size={16} />
                                    <span>
                                      {date.toLocaleDateString(undefined, { month: "long", day: "numeric" })},{" "}
                                      {yearGroup.year}
                                    </span>
                                  </div>
                                  {memory.emotion && (
                                    <div className="flex items-center gap-2">
                                      <Heart size={16} className="text-[var(--gold-primary)]" />
                                      <span className="text-sm text-[var(--gold-primary)]">{memory.emotion}</span>
                                    </div>
                                  )}
                                </div>

                                <h3 className="text-2xl mb-3 text-[var(--text-primary)]">{memory.title}</h3>

                                <p className="text-[var(--text-secondary)] leading-relaxed">
                                  {previewStory(memory.story)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
