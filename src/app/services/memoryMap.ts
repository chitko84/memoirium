import type { Memory } from "../types/memoirium";

export type MemoryLocationGroup = {
  location: string;
  memories: Memory[];
  latestMemory: Memory;
  emotions: string[];
};

function getMemoryTime(memory: Memory) {
  return new Date(memory.memory_date ?? memory.created_at).getTime();
}

export function groupMemoriesByLocation(memories: Memory[]) {
  const grouped = memories.reduce<Record<string, Memory[]>>((acc, memory) => {
    const location = memory.location?.trim();

    if (!location) return acc;

    acc[location] = [...(acc[location] ?? []), memory];
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([location, locationMemories]) => {
      const sortedMemories = [...locationMemories].sort((a, b) => getMemoryTime(b) - getMemoryTime(a));

      return {
        location,
        memories: sortedMemories,
        latestMemory: sortedMemories[0],
        emotions: Array.from(new Set(sortedMemories.map((memory) => memory.emotion).filter(Boolean) as string[])).sort(
          (a, b) => a.localeCompare(b),
        ),
      };
    })
    .sort((a, b) => getMemoryTime(b.latestMemory) - getMemoryTime(a.latestMemory));
}
