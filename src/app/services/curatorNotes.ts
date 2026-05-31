import type { Memory } from "../types/memoirium";

function formatYear(value: string | null) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getFullYear().toString();
}

function getStoryTheme(story: string) {
  const compactStory = story.trim();

  if (!compactStory) {
    return "inviting visitors to consider how personal memory becomes part of a larger life exhibition";
  }

  const firstSentence = compactStory.split(/[.!?]/)[0]?.trim();

  if (!firstSentence || firstSentence.length < 28) {
    return "inviting visitors to reflect on the emotional texture preserved in this artifact";
  }

  return `drawing attention to ${firstSentence.charAt(0).toLowerCase()}${firstSentence.slice(1)}`;
}

export function generateCuratorNote(memory: Memory) {
  const emotion = memory.emotion || "reflection";
  const location = memory.location ? ` in ${memory.location}` : "";
  const year = formatYear(memory.memory_date);
  const timePhrase = year ? ` from ${year}` : "";
  const storyTheme = getStoryTheme(memory.story);

  return `This artifact preserves "${memory.title}" as a moment of ${emotion}${location}${timePhrase}, ${storyTheme}. It invites visitors to see how a single memory can become part of a larger personal museum.`;
}
