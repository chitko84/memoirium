import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ArrowLeft, Eye, Heart, Images, Landmark, MapPin, MessageCircle, Send, Sparkles, Users } from "lucide-react";
import { GuidedTourOverlay } from "../components/GuidedTourOverlay";
import { MuseumAudioControl } from "../components/MuseumAudioControl";
import type { Collection, Memory, MemoryComment, MuseumGuestbookEntry, Profile } from "../types/memoirium";
import { addGuestbookEntry, getGuestbookEntries } from "../services/guestbook";
import {
  addMemoryComment,
  getMemoryComments,
  getMemoryLikeCounts,
  likeMemory,
} from "../services/memoryEngagement";
import { groupMemoriesByLocation } from "../services/memoryMap";
import {
  getPublicCollections,
  getPublicFeaturedMemories,
  getPublicMemoriesByCollection,
  getPublicMuseumByUsername,
  getPublicMuseumVisitCount,
  recordMuseumVisit,
} from "../services/publicMuseum";
import { generateCuratorNote } from "../services/curatorNotes";

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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function Museum() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rooms, setRooms] = useState<RoomWithMemories[]>([]);
  const [featuredMemories, setFeaturedMemories] = useState<Memory[]>([]);
  const [guestbookEntries, setGuestbookEntries] = useState<MuseumGuestbookEntry[]>([]);
  const [guestbookName, setGuestbookName] = useState("");
  const [guestbookMessage, setGuestbookMessage] = useState("");
  const [guestbookLoading, setGuestbookLoading] = useState(false);
  const [guestbookSaving, setGuestbookSaving] = useState(false);
  const [guestbookError, setGuestbookError] = useState("");
  const [guestbookSuccess, setGuestbookSuccess] = useState("");
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [likingMemoryIds, setLikingMemoryIds] = useState<Set<string>>(new Set());
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [commentsByMemory, setCommentsByMemory] = useState<Record<string, MemoryComment[]>>({});
  const [commentsLoadingIds, setCommentsLoadingIds] = useState<Set<string>>(new Set());
  const [commentForms, setCommentForms] = useState<Record<string, { name: string; comment: string }>>({});
  const [commentSavingIds, setCommentSavingIds] = useState<Set<string>>(new Set());
  const [commentErrors, setCommentErrors] = useState<Record<string, string>>({});
  const [expandedMapLocation, setExpandedMapLocation] = useState<string | null>(null);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
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
        const visibleMemoryIds = Array.from(
          new Set([...featured, ...roomsWithMemories.flatMap((room) => room.memories)].map((memory) => memory.id)),
        );

        setRooms(roomsWithMemories);
        setFeaturedMemories(featured);
        setGuestbookLoading(true);

        try {
          const [entries, counts] = await Promise.all([
            getGuestbookEntries(publicProfile.id),
            getMemoryLikeCounts(visibleMemoryIds),
          ]);

          setGuestbookEntries(entries);
          setLikeCounts(counts);
        } catch {
          setGuestbookError("Public engagement is temporarily unavailable.");
        } finally {
          setGuestbookLoading(false);
        }

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
  const publicTourMemories = useMemo(
    () =>
      Array.from(
        new Map(
          [...featuredMemories, ...rooms.flatMap((room) => room.memories)].map((memory) => [memory.id, memory]),
        ).values(),
      ),
    [featuredMemories, rooms],
  );
  const publicLocationGroups = useMemo(() => groupMemoriesByLocation(publicTourMemories), [publicTourMemories]);
  const tourMemory = tourIndex === null ? null : publicTourMemories[tourIndex] ?? null;

  const museumTitle = profile?.museum_title || `The Museum of ${profile?.display_name ?? "Memoirium"}`;
  const heroImage =
    featuredMemories.find((memory) => memory.image_url)?.image_url ??
    rooms.find((room) => room.collection.cover_image_url)?.collection.cover_image_url ??
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1600&h=700&fit=crop";

  const scrollToRoom = (roomId: string) => {
    document.getElementById(`room-${roomId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (tourIndex === null) return;

    if (publicTourMemories.length === 0) {
      setTourIndex(null);
      return;
    }

    if (tourIndex > publicTourMemories.length - 1) {
      setTourIndex(publicTourMemories.length - 1);
    }
  }, [publicTourMemories, tourIndex]);

  useEffect(() => {
    if (!tourMemory) return;

    const visibleArtifact = Array.from(
      document.querySelectorAll<HTMLElement>(`[data-public-tour-artifact="${tourMemory.id}"]`),
    ).find((element) => element.offsetParent !== null);

    visibleArtifact?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [tourMemory]);

  const startPublicTour = () => {
    if (publicTourMemories.length === 0) return;
    setTourIndex(0);
  };

  const goToPreviousTourMemory = () => {
    setTourIndex((current) => {
      if (current === null || publicTourMemories.length === 0) return current;
      return current === 0 ? publicTourMemories.length - 1 : current - 1;
    });
  };

  const goToNextTourMemory = () => {
    setTourIndex((current) => {
      if (current === null || publicTourMemories.length === 0) return current;
      return current === publicTourMemories.length - 1 ? 0 : current + 1;
    });
  };

  const viewPublicTourArtifact = (memoryId: string) => {
    setTourIndex(null);
    window.setTimeout(() => {
      const visibleArtifact = Array.from(
        document.querySelectorAll<HTMLElement>(`[data-public-tour-artifact="${memoryId}"]`),
      ).find((element) => element.offsetParent !== null);

      visibleArtifact?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (expandedCommentsId !== memoryId) {
        void toggleComments(memoryId);
      }
    }, 0);
  };

  const handleLikeMemory = async (memoryId: string) => {
    if (likingMemoryIds.has(memoryId)) return;

    setLikingMemoryIds((current) => new Set(current).add(memoryId));

    try {
      await likeMemory(memoryId);
      const updatedCounts = await getMemoryLikeCounts([memoryId]);
      setLikeCounts((counts) => ({ ...counts, ...updatedCounts }));
    } catch {
      setLikeCounts((counts) => ({ ...counts }));
    } finally {
      setLikingMemoryIds((current) => {
        const next = new Set(current);
        next.delete(memoryId);
        return next;
      });
    }
  };

  const toggleComments = async (memoryId: string) => {
    const isOpen = expandedCommentsId === memoryId;
    setExpandedCommentsId(isOpen ? null : memoryId);

    if (isOpen || commentsByMemory[memoryId] || commentsLoadingIds.has(memoryId)) {
      return;
    }

    setCommentsLoadingIds((current) => new Set(current).add(memoryId));
    setCommentErrors((current) => ({ ...current, [memoryId]: "" }));

    try {
      const comments = await getMemoryComments(memoryId);
      setCommentsByMemory((current) => ({ ...current, [memoryId]: comments }));
    } catch {
      setCommentErrors((current) => ({
        ...current,
        [memoryId]: "Comments are temporarily unavailable.",
      }));
    } finally {
      setCommentsLoadingIds((current) => {
        const next = new Set(current);
        next.delete(memoryId);
        return next;
      });
    }
  };

  const updateCommentForm = (memoryId: string, field: "name" | "comment", value: string) => {
    setCommentForms((current) => ({
      ...current,
      [memoryId]: {
        name: current[memoryId]?.name ?? "",
        comment: current[memoryId]?.comment ?? "",
        [field]: value,
      },
    }));
  };

  const handleAddComment = async (memoryId: string) => {
    const form = commentForms[memoryId] ?? { name: "", comment: "" };
    const visitorName = form.name.trim();
    const comment = form.comment.trim();

    if (!visitorName || !comment) {
      setCommentErrors((current) => ({ ...current, [memoryId]: "Add your name and comment before posting." }));
      return;
    }

    setCommentSavingIds((current) => new Set(current).add(memoryId));
    setCommentErrors((current) => ({ ...current, [memoryId]: "" }));

    try {
      const savedComment = await addMemoryComment(memoryId, visitorName, comment);
      setCommentsByMemory((current) => ({
        ...current,
        [memoryId]: [savedComment, ...(current[memoryId] ?? [])],
      }));
      setCommentForms((current) => ({ ...current, [memoryId]: { name: "", comment: "" } }));
    } catch {
      setCommentErrors((current) => ({ ...current, [memoryId]: "Unable to post this comment." }));
    } finally {
      setCommentSavingIds((current) => {
        const next = new Set(current);
        next.delete(memoryId);
        return next;
      });
    }
  };

  const handleAddGuestbookEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profile) return;

    const visitorName = guestbookName.trim();
    const message = guestbookMessage.trim();

    setGuestbookError("");
    setGuestbookSuccess("");

    if (!visitorName || !message) {
      setGuestbookError("Add your name and a message before signing.");
      return;
    }

    setGuestbookSaving(true);

    try {
      const savedEntry = await addGuestbookEntry(profile.id, visitorName, message);
      setGuestbookEntries((entries) => [savedEntry, ...entries]);
      setGuestbookName("");
      setGuestbookMessage("");
      setGuestbookSuccess("Your note has been added to the guestbook.");
    } catch {
      setGuestbookError("Unable to sign the guestbook right now.");
    } finally {
      setGuestbookSaving(false);
    }
  };

  const renderEngagementControls = (memory: Memory) => (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => void handleLikeMemory(memory.id)}
        disabled={likingMemoryIds.has(memory.id)}
        className="inline-flex items-center gap-2 border border-[var(--gold-primary)]/30 px-3 py-2 text-sm text-[var(--gold-primary)] transition-colors hover:border-[var(--gold-primary)] hover:bg-[var(--gold-primary)] hover:text-[#0F1115] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Heart size={15} />
        <span>{likeCounts[memory.id] ?? 0}</span>
      </button>
      <button
        type="button"
        onClick={() => void toggleComments(memory.id)}
        className="inline-flex items-center gap-2 border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--gold-primary)] hover:text-[var(--gold-primary)]"
      >
        <MessageCircle size={15} />
        <span>{expandedCommentsId === memory.id ? "Hide comments" : "Comments"}</span>
      </button>
    </div>
  );

  const renderCommentsPanel = (memory: Memory) => {
    if (expandedCommentsId !== memory.id) return null;

    const comments = commentsByMemory[memory.id] ?? [];
    const form = commentForms[memory.id] ?? { name: "", comment: "" };
    const isLoadingComments = commentsLoadingIds.has(memory.id);
    const isSavingComment = commentSavingIds.has(memory.id);
    const errorMessage = commentErrors[memory.id];

    return (
      <div className="border-t border-[var(--border)] bg-black/20 p-5">
        <div className="mb-5 border-l border-[var(--gold-primary)]/45 pl-4">
          <p className="mb-1 text-xs uppercase tracking-[0.25em] text-[var(--gold-secondary)]">Curator's Note</p>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{generateCuratorNote(memory)}</p>
        </div>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void handleAddComment(memory.id);
          }}
        >
          <input
            value={form.name}
            onChange={(event) => updateCommentForm(memory.id, "name", event.target.value)}
            maxLength={80}
            className="w-full border border-[var(--border)] bg-[var(--surface-light)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--gold-primary)]"
            placeholder="Your name"
          />
          <textarea
            value={form.comment}
            onChange={(event) => updateCommentForm(memory.id, "comment", event.target.value)}
            maxLength={1000}
            rows={3}
            className="w-full resize-none border border-[var(--border)] bg-[var(--surface-light)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--gold-primary)]"
            placeholder="Leave a comment"
          />
          {errorMessage && <p className="text-sm text-red-200">{errorMessage}</p>}
          <div>
            <Button type="submit" size="sm" disabled={isSavingComment}>
              <Send size={15} />
              {isSavingComment ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>

        <div className="mt-5 space-y-3">
          {isLoadingComments && <p className="text-sm text-[var(--text-secondary)]">Loading comments...</p>}
          {!isLoadingComments && comments.length === 0 && (
            <p className="text-sm text-[var(--text-secondary)]">No comments yet. Be the first visitor to respond.</p>
          )}
          {comments.map((comment) => (
            <div key={comment.id} className="border border-[var(--border)] bg-[var(--surface)] p-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="text-sm text-[var(--gold-primary)]">{comment.visitor_name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{formatDateTime(comment.created_at)}</p>
              </div>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{comment.comment}</p>
            </div>
          ))}
        </div>
      </div>
    );
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

                  <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-start">
                    <Button variant="primary" onClick={startPublicTour} disabled={publicTourMemories.length === 0}>
                      <Sparkles size={18} />
                      Start Public Tour
                    </Button>
                    <MuseumAudioControl />
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
                        <div
                          data-public-tour-artifact={memory.id}
                          className={`aspect-square overflow-hidden bg-[var(--surface-light)] relative transition-all duration-300 ${
                            tourMemory?.id === memory.id ? "ring-2 ring-[var(--gold-primary)] ring-offset-4 ring-offset-black" : ""
                          }`}
                        >
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
                          <div className="mt-4 border-l border-[var(--gold-primary)]/40 pl-3">
                            <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[var(--gold-secondary)]">
                              Curator's Note
                            </p>
                            <p className="line-clamp-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                              {generateCuratorNote(memory)}
                            </p>
                          </div>
                          {renderEngagementControls(memory)}
                        </div>
                        {renderCommentsPanel(memory)}
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
                          data-public-tour-artifact={memory.id}
                          className="group border border-[var(--gold-primary)]/20 bg-[var(--surface)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--gold-primary)]"
                          style={{ boxShadow: "0 14px 44px rgba(0, 0, 0, 0.35)" }}
                        >
                          <div className="aspect-[4/3] overflow-hidden bg-[var(--surface-light)] relative">
                            <div
                              className={`absolute inset-0 z-10 pointer-events-none transition-all duration-300 ${
                                tourMemory?.id === memory.id
                                  ? "ring-2 ring-inset ring-[var(--gold-primary)]"
                                  : ""
                              }`}
                            />
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
                            <div className="mt-4 border-l border-[var(--gold-primary)]/40 pl-3">
                              <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[var(--gold-secondary)]">
                                Curator's Note
                              </p>
                              <p className="line-clamp-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                                {generateCuratorNote(memory)}
                              </p>
                            </div>
                            {renderEngagementControls(memory)}
                          </div>
                          {renderCommentsPanel(memory)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}

          <section className="py-20 px-6 bg-[var(--surface)]/20">
            <div className="max-w-7xl mx-auto">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12">
                <h2 className="text-4xl mb-4 text-[var(--gold-primary)]">Memory Map</h2>
                <p className="text-lg text-[var(--text-secondary)]">
                  Public places represented in this museum's visible artifacts.
                </p>
              </motion.div>

              {publicLocationGroups.length === 0 ? (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                  <MapPin size={32} className="mx-auto mb-4 text-[var(--gold-primary)]" />
                  <p className="text-[var(--text-secondary)]">
                    No public memory locations have been added to this museum yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  {publicLocationGroups.map((group, index) => {
                    const isExpanded = expandedMapLocation === group.location;

                    return (
                      <motion.div
                        key={group.location}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="rounded-lg border border-[var(--gold-primary)]/25 bg-[var(--surface)] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setExpandedMapLocation(isExpanded ? null : group.location)}
                            className="block w-full p-6 text-left"
                          >
                            <div className="mb-5 flex items-start justify-between gap-4">
                              <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--gold-primary)]/35 bg-[var(--gold-primary)]/10">
                                  <MapPin size={24} className="text-[var(--gold-primary)]" />
                                </div>
                                <div>
                                  <h3 className="text-2xl text-[var(--gold-primary)]">{group.location}</h3>
                                  <p className="text-sm text-[var(--text-secondary)]">
                                    {group.memories.length} public{" "}
                                    {group.memories.length === 1 ? "memory" : "memories"}
                                  </p>
                                </div>
                              </div>
                              <span className="border border-[var(--gold-primary)]/25 px-3 py-1 text-xs text-[var(--gold-secondary)]">
                                {isExpanded ? "Hide" : "Explore"}
                              </span>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="border border-[var(--border)] bg-black/20 p-4">
                                <p className="mb-1 text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                                  Latest Artifact
                                </p>
                                <p className="text-[var(--text-primary)]">{group.latestMemory.title}</p>
                                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                                  {formatDate(group.latestMemory.memory_date)}
                                </p>
                              </div>
                              <div className="border border-[var(--border)] bg-black/20 p-4">
                                <p className="mb-2 text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                                  Emotions
                                </p>
                                {group.emotions.length === 0 ? (
                                  <p className="text-sm text-[var(--text-secondary)]">No public emotions tagged.</p>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {group.emotions.map((emotion) => (
                                      <span
                                        key={emotion}
                                        className="border border-[var(--gold-primary)]/25 bg-[var(--gold-primary)]/10 px-2 py-1 text-xs text-[var(--gold-primary)]"
                                      >
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
                                  <div key={memory.id} className="border border-[var(--border)] bg-[var(--surface)] p-4">
                                    <p className="text-[var(--text-primary)]">{memory.title}</p>
                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                      {formatDate(memory.memory_date)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="py-20 px-6 bg-[var(--surface)]/30">
            <div className="max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12">
                <h2 className="text-4xl mb-4 text-[var(--gold-primary)]">Visitor Guestbook</h2>
                <p className="text-lg text-[var(--text-secondary)]">
                  Leave a note for the curator after walking through the museum.
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
                <form
                  onSubmit={(event) => void handleAddGuestbookEntry(event)}
                  className="rounded-lg border border-[var(--gold-primary)]/25 bg-[var(--surface)] p-6"
                >
                  <div className="mb-5">
                    <label htmlFor="guestbook-name" className="mb-2 block text-sm text-[var(--gold-primary)]">
                      Name
                    </label>
                    <input
                      id="guestbook-name"
                      value={guestbookName}
                      onChange={(event) => setGuestbookName(event.target.value)}
                      maxLength={80}
                      className="w-full border border-[var(--border)] bg-[var(--surface-light)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--gold-primary)]"
                      placeholder="How should the curator remember you?"
                    />
                  </div>
                  <div className="mb-5">
                    <label htmlFor="guestbook-message" className="mb-2 block text-sm text-[var(--gold-primary)]">
                      Message
                    </label>
                    <textarea
                      id="guestbook-message"
                      value={guestbookMessage}
                      onChange={(event) => setGuestbookMessage(event.target.value)}
                      maxLength={1000}
                      rows={6}
                      className="w-full resize-none border border-[var(--border)] bg-[var(--surface-light)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--gold-primary)]"
                      placeholder="Share a reflection from your visit."
                    />
                  </div>
                  {guestbookError && <p className="mb-4 text-sm text-red-200">{guestbookError}</p>}
                  {guestbookSuccess && <p className="mb-4 text-sm text-[var(--gold-secondary)]">{guestbookSuccess}</p>}
                  <Button type="submit" disabled={guestbookSaving}>
                    <Send size={17} />
                    {guestbookSaving ? "Signing..." : "Sign Guestbook"}
                  </Button>
                </form>

                <div className="rounded-lg border border-[var(--border)] bg-black/20 p-6">
                  {guestbookLoading && <p className="text-[var(--text-secondary)]">Loading guestbook entries...</p>}
                  {!guestbookLoading && guestbookEntries.length === 0 && (
                    <div className="flex min-h-56 items-center justify-center text-center">
                      <div>
                        <MessageCircle size={34} className="mx-auto mb-4 text-[var(--gold-primary)]" />
                        <h3 className="text-2xl mb-2 text-[var(--gold-primary)]">No guestbook entries yet</h3>
                        <p className="text-[var(--text-secondary)]">
                          This guestbook is waiting for its first visitor note.
                        </p>
                      </div>
                    </div>
                  )}
                  {!guestbookLoading && guestbookEntries.length > 0 && (
                    <div className="space-y-4">
                      {guestbookEntries.map((entry) => (
                        <article key={entry.id} className="border border-[var(--border)] bg-[var(--surface)] p-4">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-lg text-[var(--gold-primary)]">{entry.visitor_name}</h3>
                            <p className="text-xs text-[var(--text-secondary)]">{formatDateTime(entry.created_at)}</p>
                          </div>
                          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{entry.message}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

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

      {tourMemory && (
        <GuidedTourOverlay
          memory={tourMemory}
          currentStep={tourIndex === null ? 1 : tourIndex + 1}
          totalSteps={publicTourMemories.length}
          onPrevious={goToPreviousTourMemory}
          onNext={goToNextTourMemory}
          onEnd={() => setTourIndex(null)}
          onViewFull={() => viewPublicTourArtifact(tourMemory.id)}
        />
      )}
    </div>
  );
}
