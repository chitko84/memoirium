import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import {
  Archive,
  Calendar,
  Clock,
  FolderOpen,
  Frame,
  Globe,
  Heart,
  Images,
  Landmark,
  MapPin,
  Plus,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { getUserCollections } from "../services/collections";
import { getUserMemories } from "../services/memories";
import { getCurrentProfile } from "../services/profiles";
import { getMuseumAchievements } from "../services/achievements";
import type { Collection, Memory, Profile } from "../types/memoirium";

function formatDate(value: string | null) {
  if (!value) return "Date not set";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return;

      setIsLoading(true);
      setError("");

      try {
        const [profileData, collectionData, memoryData] = await Promise.all([
          getCurrentProfile(user.id),
          getUserCollections(user.id),
          getUserMemories(user.id),
        ]);
        setProfile(profileData);
        setCollections(collectionData);
        setMemories(memoryData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load your museum dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, [user]);

  const recentMemories = memories.slice(0, 4);
  const locationCount = new Set(memories.map((memory) => memory.location?.trim()).filter(Boolean)).size;
  const publicMemoryCount = memories.filter((memory) => memory.is_public).length;
  const achievements = getMuseumAchievements({ profile, collections, memories });
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked).length;
  const stats = [
    { icon: Images, label: "Total Memories", value: memories.length.toString(), trend: "In your archive" },
    { icon: FolderOpen, label: "Collections", value: collections.length.toString(), trend: "Exhibition rooms" },
    { icon: Globe, label: "Public Memories", value: publicMemoryCount.toString(), trend: "Visible artifacts" },
    { icon: MapPin, label: "Locations", value: locationCount.toString(), trend: "Mapped places" },
  ];
  const achievementIcons = {
    Archive,
    Clock,
    Frame,
    Globe,
    Images,
    Landmark,
    MapPin,
    Sparkles,
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} showSearch />

        <main className="flex-1 p-6 lg:p-8 mt-16">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-4xl mb-2 text-[var(--gold-primary)]">Welcome Back</h1>
              <p className="text-[var(--text-secondary)]">Continue curating your memories</p>
            </motion.div>

            {isLoading && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                <p className="text-[var(--gold-primary)]">Opening your museum dashboard...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-8 text-center">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {!isLoading && !error && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-[var(--gold-primary)]/10 rounded-lg flex items-center justify-center">
                              <Icon size={24} className="text-[var(--gold-primary)]" />
                            </div>
                          </div>
                          <h3 className="text-3xl mb-2 text-[var(--text-primary)]">{stat.value}</h3>
                          <p className="text-sm text-[var(--text-secondary)] mb-1">{stat.label}</p>
                          <p className="text-xs text-[var(--gold-primary)]">{stat.trend}</p>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                <section className="mb-10">
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-2xl text-[var(--gold-primary)]">Museum Achievements</h2>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {unlockedAchievements} of {achievements.length} unlocked from your real museum activity.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/map")}>
                      <MapPin size={18} />
                      Open Memory Map
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {achievements.map((achievement, index) => {
                      const Icon = achievementIcons[achievement.icon as keyof typeof achievementIcons] ?? Sparkles;
                      const progressPercent = Math.round(
                        (achievement.progress.current / achievement.progress.target) * 100,
                      );

                      return (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                        >
                          <div
                            className={`h-full rounded-lg border p-5 ${
                              achievement.unlocked
                                ? "border-[var(--gold-primary)]/45 bg-[var(--gold-primary)]/10"
                                : "border-[var(--border)] bg-[var(--surface)]"
                            }`}
                            style={{ boxShadow: "0 12px 34px rgba(0, 0, 0, 0.28)" }}
                          >
                            <div className="mb-4 flex items-start justify-between gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--gold-primary)]/30 bg-black/25">
                                <Icon size={22} className="text-[var(--gold-primary)]" />
                              </div>
                              <span
                                className={`border px-2 py-1 text-xs ${
                                  achievement.unlocked
                                    ? "border-[var(--gold-primary)]/30 text-[var(--gold-primary)]"
                                    : "border-[var(--border)] text-[var(--text-secondary)]"
                                }`}
                              >
                                {achievement.unlocked ? "Unlocked" : "Locked"}
                              </span>
                            </div>
                            <h3 className="mb-2 text-lg text-[var(--text-primary)]">{achievement.title}</h3>
                            <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                              {achievement.description}
                            </p>
                            <div className="h-2 overflow-hidden rounded-full bg-black/35">
                              <div
                                className="h-full bg-[var(--gold-primary)] transition-all"
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                              />
                            </div>
                            <p className="mt-2 text-xs text-[var(--text-secondary)]">
                              {achievement.progress.current} / {achievement.progress.target}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl text-[var(--gold-primary)]">Recent Memories</h2>
                    <Button variant="outline" size="sm" onClick={() => navigate("/collections")}>
                      <Plus size={18} />
                      Add Memory
                    </Button>
                  </div>

                  {recentMemories.length === 0 ? (
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                      <Images size={32} className="mx-auto mb-4 text-[var(--gold-primary)]" />
                      <h3 className="text-2xl mb-2 text-[var(--gold-primary)]">No memories archived yet</h3>
                      <p className="text-[var(--text-secondary)] mb-6">
                        Create an exhibition room, then add the first memory artifact.
                      </p>
                      <Button variant="primary" onClick={() => navigate("/collections")}>
                        <Plus size={18} />
                        Open Exhibition Rooms
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {recentMemories.map((memory, index) => (
                        <motion.div
                          key={memory.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
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
                                  <Images size={34} className="text-[var(--gold-primary)]/60" />
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="text-lg mb-2 text-[var(--text-primary)]">{memory.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
                                <Calendar size={14} />
                                <span>{formatDate(memory.memory_date)}</span>
                              </div>
                              {memory.emotion && (
                                <div className="flex items-center gap-2">
                                  <Heart size={14} className="text-[var(--gold-primary)]" />
                                  <span className="px-3 py-1 bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] text-xs rounded-full border border-[var(--gold-primary)]/20">
                                    {memory.emotion}
                                  </span>
                                </div>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
