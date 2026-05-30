import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ArrowLeft, Eye, Heart, Images, Landmark, Users } from "lucide-react";
import type { Collection, Memory, Profile } from "../types/memoirium";
import {
  getPublicCollections,
  getPublicFeaturedMemories,
  getPublicMemoriesByCollection,
  getPublicMuseumByUsername,
  getPublicMuseumVisitCount,
  recordMuseumVisit,
} from "../services/publicMuseum";

type RoomWithMemories = {
  collection: Collection;
  memories: Memory[];
};

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "MC"
  );
}

function formatDate(value: string | null) {
  if (!value) return "Date unknown";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function Museum() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rooms, setRooms] = useState<RoomWithMemories[]>([]);
  const [featuredMemories, setFeaturedMemories] = useState<Memory[]>([]);
  const [visitCount, setVisitCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const visitRecordedRef = useRef(false);

  useEffect(() => {
    const loadMuseum = async () => {
      if (!username) {
        setIsLoading(false);
        setError("Choose a public museum to enter.");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const publicProfile = await getPublicMuseumByUsername(username);

        if (!publicProfile) {
          setProfile(null);
          setError("This museum is private or could not be found.");
          return;
        }

        setProfile(publicProfile);

        if (!visitRecordedRef.current) {
          visitRecordedRef.current = true;
          recordMuseumVisit(publicProfile.id).catch(() => {
            // Visit recording should never block public viewing.
          });
        }

        const [publicCollections, featured] = await Promise.all([
          getPublicCollections(publicProfile.id),
          getPublicFeaturedMemories(publicProfile.id),
        ]);

        const roomsWithMemories = await Promise.all(
          publicCollections.map(async (collection) => ({
            collection,
            memories: await getPublicMemoriesByCollection(collection.id),
          })),
        );

        setRooms(roomsWithMemories);
        setFeaturedMemories(featured);

        try {
          setVisitCount(await getPublicMuseumVisitCount(publicProfile.id));
        } catch {
          setVisitCount(0);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to open this public museum.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadMuseum();
  }, [username]);

  const totalPublicMemories = useMemo(
    () => rooms.reduce((total, room) => total + room.memories.length, 0),
    [rooms],
  );

  const museumTitle = profile?.museum_title || `The Museum of ${profile?.display_name ?? "Memoirium"}`;
  const heroImage =
    featuredMemories.find((memory) => memory.image_url)?.image_url ??
    rooms.find((room) => room.collection.cover_image_url)?.collection.cover_image_url ??
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1600&h=700&fit=crop";

  const scrollToRoom = (roomId: string) => {
    document.getElementById(`room-${roomId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-hidden">
      {isLoading && (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
            <Landmark size={36} className="mx-auto mb-4 text-[var(--gold-primary)]" />
            <p className="text-[var(--gold-primary)]">Opening public museum...</p>
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
            <Landmark size={42} className="mx-auto mb-5 text-[var(--gold-primary)]" />
            <h1 className="text-4xl mb-4 text-[var(--gold-primary)]">Museum Not Found</h1>
            <p className="text-[var(--text-secondary)] mb-8">{error}</p>
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft size={18} />
              Back to Home
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !error && profile && (
        <>
          <div className="relative min-h-[78vh] overflow-hidden" style={{ perspective: "1200px" }}>
            <img src={heroImage} alt={museumTitle} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/75 to-black/40" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(212,175,55,0.22),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(244,228,188,0.10),transparent_28%)]" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--background)] to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto min-h-[78vh] px-6 lg:px-8 flex items-end pb-16">
              <div className="w-full">
                <Button variant="outline" size="sm" onClick={() => navigate("/")} className="mb-8">
                  <ArrowLeft size={18} />
                  Back to Home
                </Button>

                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="mb-5 inline-flex items-center gap-2 border border-[var(--gold-primary)]/30 bg-black/30 px-4 py-2 text-sm text-[var(--gold-secondary)] backdrop-blur">
                    <Landmark size={16} />
                    Public Digital Museum
                  </div>
                  <h1 className="text-5xl md:text-7xl mb-5 text-[var(--gold-primary)] max-w-5xl">
                    {museumTitle}
                  </h1>
                  <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-3xl leading-relaxed">
                    {profile.museum_tagline || profile.bio || "Every memory deserves a gallery."}
                  </p>

                  <div className="flex items-center gap-3 mb-9">
                    <div className="w-12 h-12 rounded-full bg-[var(--gold-primary)] flex items-center justify-center text-[#0F1115] font-semibold">
                      {getInitials(profile.display_name)}
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Curator</p>
                      <p className="text-lg text-[var(--text-primary)]">{profile.display_name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
                    <div className="border border-[var(--gold-primary)]/25 bg-black/30 p-4 backdrop-blur">
                      <div className="flex items-center gap-2 text-[var(--gold-primary)] mb-1">
                        <Images size={18} />
                        <span className="text-2xl">{totalPublicMemories}</span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">Public Memories</p>
                    </div>
                    <div className="border border-[var(--gold-primary)]/25 bg-black/30 p-4 backdrop-blur">
                      <div className="flex items-center gap-2 text-[var(--gold-primary)] mb-1">
                        <Users size={18} />
                        <span className="text-2xl">{rooms.length}</span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">Exhibition Rooms</p>
                    </div>
                    <div className="border border-[var(--gold-primary)]/25 bg-black/30 p-4 backdrop-blur">
                      <div className="flex items-center gap-2 text-[var(--gold-primary)] mb-1">
                        <Eye size={18} />
                        <span className="text-2xl">{visitCount}</span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">Recorded Visits</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <section className="relative py-20 px-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.12),transparent_35%)]" />
            <div className="relative max-w-7xl mx-auto">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12">
                <h2 className="text-4xl mb-4 text-[var(--gold-primary)]">Exhibition Rooms</h2>
                <p className="text-lg text-[var(--text-secondary)]">
                  Walk the public rooms of this personal museum.
                </p>
              </motion.div>

              {rooms.length === 0 ? (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
                  <Images size={34} className="mx-auto mb-4 text-[var(--gold-primary)]" />
                  <h3 className="text-3xl mb-3 text-[var(--gold-primary)]">No public exhibition rooms yet</h3>
                  <p className="text-[var(--text-secondary)]">
                    This curator has not opened any rooms to public visitors.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 [perspective:1200px]">
                  {rooms.map(({ collection, memories }, index) => (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0, y: 28, rotateX: 8 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      whileHover={{ y: -8, rotateX: 3, rotateY: index % 2 === 0 ? -3 : 3 }}
                    >
                      <Card hoverable onClick={() => scrollToRoom(collection.id)}>
                        <div className="aspect-video overflow-hidden relative bg-[var(--surface-light)] border-b border-[var(--gold-primary)]/20">
                          {collection.cover_image_url ? (
                            <img
                              src={collection.cover_image_url}
                              alt={collection.title}
                              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Landmark size={42} className="text-[var(--gold-primary)]/60" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                          <div className="absolute inset-3 border border-[var(--gold-primary)]/35 pointer-events-none" />
                          <div className="absolute bottom-5 left-5 right-5">
                            <h3 className="text-2xl mb-1 text-white">{collection.title}</h3>
                            <p className="text-sm text-white/75 line-clamp-2">{collection.description}</p>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 text-sm text-[var(--gold-primary)]">
                            <Images size={16} />
                            <span>{memories.length} public memories</span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="py-20 px-6 bg-[var(--surface)]/30">
            <div className="max-w-7xl mx-auto">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12">
                <h2 className="text-4xl mb-4 text-[var(--gold-primary)]">Featured Artifacts</h2>
                <p className="text-lg text-[var(--text-secondary)]">
                  Signature memories selected for the museum entrance hall.
                </p>
              </motion.div>

              {featuredMemories.length === 0 ? (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                  <Heart size={32} className="mx-auto mb-4 text-[var(--gold-primary)]" />
                  <p className="text-[var(--text-secondary)]">No featured artifacts have been placed yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 [perspective:1000px]">
                  {featuredMemories.map((memory, index) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      whileHover={{ y: -6, rotateY: 3 }}
                    >
                      <Card hoverable>
                        <div className="aspect-square overflow-hidden bg-[var(--surface-light)] relative">
                          {memory.image_url ? (
                            <img
                              src={memory.image_url}
                              alt={memory.title}
                              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Images size={34} className="text-[var(--gold-primary)]/60" />
                            </div>
                          )}
                          <div className="absolute inset-2 border border-[var(--gold-primary)]/30" />
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg mb-2 text-[var(--text-primary)]">{memory.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-[var(--gold-primary)]">
                            <Heart size={14} />
                            <span>{memory.emotion || "Memory artifact"}</span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {rooms.map(({ collection, memories }) => (
            <section id={`room-${collection.id}`} key={collection.id} className="py-20 px-6 scroll-mt-12">
              <div className="max-w-7xl mx-auto">
                <div className="mb-10 border-l border-[var(--gold-primary)] pl-6">
                  <h2 className="text-4xl mb-3 text-[var(--gold-primary)]">{collection.title}</h2>
                  <p className="text-[var(--text-secondary)] max-w-3xl leading-relaxed">
                    {collection.curator_note || collection.description || "A public room of preserved memories."}
                  </p>
                </div>

                {memories.length === 0 ? (
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                    <Images size={30} className="mx-auto mb-4 text-[var(--gold-primary)]" />
                    <p className="text-[var(--text-secondary)]">
                      This public exhibition room has no visible memory artifacts yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {memories.map((memory, index) => (
                      <motion.div
                        key={memory.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div
                          className="group border border-[var(--gold-primary)]/20 bg-[var(--surface)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--gold-primary)]"
                          style={{ boxShadow: "0 14px 44px rgba(0, 0, 0, 0.35)" }}
                        >
                          <div className="aspect-[4/3] overflow-hidden bg-[var(--surface-light)] relative">
                            {memory.image_url ? (
                              <img
                                src={memory.image_url}
                                alt={memory.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Images size={34} className="text-[var(--gold-primary)]/60" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                          </div>
                          <div className="p-5">
                            <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                              {formatDate(memory.memory_date)}
                            </p>
                            <h3 className="text-2xl mb-3 text-[var(--text-primary)]">{memory.title}</h3>
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-3">{memory.story}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}

          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-4xl mb-6 text-[var(--gold-primary)]">Museum Statistics</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <div className="text-5xl mb-2 text-[var(--gold-primary)]">{visitCount}</div>
                    <p className="text-[var(--text-secondary)]">Recorded Visits</p>
                  </div>
                  <div>
                    <div className="text-5xl mb-2 text-[var(--gold-primary)]">{rooms.length}</div>
                    <p className="text-[var(--text-secondary)]">Exhibition Rooms</p>
                  </div>
                  <div>
                    <div className="text-5xl mb-2 text-[var(--gold-primary)]">{totalPublicMemories}</div>
                    <p className="text-[var(--text-secondary)]">Public Memories</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
