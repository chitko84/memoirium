import type { Collection, Memory, Profile } from "../types/memoirium";

export type MuseumAchievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: {
    current: number;
    target: number;
  };
  icon: string;
};

function progress(current: number, target: number) {
  return {
    current: Math.min(current, target),
    target,
  };
}

export function getMuseumAchievements({
  profile,
  collections,
  memories,
}: {
  profile: Profile | null;
  collections: Collection[];
  memories: Memory[];
}) {
  const datedMemories = memories.filter((memory) => memory.memory_date).length;
  const imageMemories = memories.filter((memory) => memory.image_url).length;
  const featuredMemories = memories.filter((memory) => memory.is_featured).length;
  const locationCount = new Set(
    memories.map((memory) => memory.location?.trim()).filter(Boolean) as string[],
  ).size;

  const achievementData = [
    {
      id: "first-exhibition-room",
      title: "First Exhibition Room",
      description: "Create the first room in your personal museum.",
      current: collections.length,
      target: 1,
      icon: "Landmark",
    },
    {
      id: "first-artifact",
      title: "First Artifact",
      description: "Archive your first memory artifact.",
      current: memories.length,
      target: 1,
      icon: "Images",
    },
    {
      id: "ten-memories-curated",
      title: "10 Memories Curated",
      description: "Build a substantial collection of preserved memories.",
      current: memories.length,
      target: 10,
      icon: "Archive",
    },
    {
      id: "public-museum-published",
      title: "Public Museum Published",
      description: "Open your museum for visitors.",
      current: profile?.is_public ? 1 : 0,
      target: 1,
      icon: "Globe",
    },
    {
      id: "timeline-curator",
      title: "Timeline Curator",
      description: "Date at least three memories for the timeline.",
      current: datedMemories,
      target: 3,
      icon: "Clock",
    },
    {
      id: "gallery-explorer",
      title: "Gallery Explorer",
      description: "Add images to at least five memory artifacts.",
      current: imageMemories,
      target: 5,
      icon: "Frame",
    },
    {
      id: "featured-artifact-curator",
      title: "Featured Artifact Curator",
      description: "Feature at least one signature memory.",
      current: featuredMemories,
      target: 1,
      icon: "Sparkles",
    },
    {
      id: "world-memory-keeper",
      title: "World Memory Keeper",
      description: "Preserve memories from at least three different locations.",
      current: locationCount,
      target: 3,
      icon: "MapPin",
    },
  ];

  return achievementData.map<MuseumAchievement>((achievement) => ({
    id: achievement.id,
    title: achievement.title,
    description: achievement.description,
    unlocked: achievement.current >= achievement.target,
    progress: progress(achievement.current, achievement.target),
    icon: achievement.icon,
  }));
}
