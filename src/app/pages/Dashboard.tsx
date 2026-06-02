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
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
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

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

const assistantQuestions = [
  {
    questions: ["how do i add an artifact", "add artifact", "upload memory", "create memory"],
    answer: "Open Exhibition Rooms, choose a room, then use Add Artifact to archive a memory with a title, date, story, and image.",
  },
  {
    questions: ["how do i create a collection", "create collection", "new exhibition room", "add room"],
    answer: "Go to Exhibition Rooms and create a new room. Collections keep related artifacts grouped together for easier browsing.",
  },
  {
    questions: ["what is an artifact", "artifact meaning", "what are artifacts", "memory artifact"],
    answer: "An artifact is one saved memory in your museum. It can include an image, date, location, emotion, and written story.",
  },
  {
    questions: ["what is an exhibition room", "room meaning", "collection meaning", "what are rooms"],
    answer: "An exhibition room is a collection. Use rooms to organize artifacts by person, trip, event, year, theme, or family branch.",
  },
  {
    questions: ["how do achievements work", "achievement", "badges", "unlock achievements"],
    answer: "Achievements unlock from your real museum activity, such as adding artifacts, building rooms, mapping locations, and sharing public memories.",
  },
  {
    questions: ["why is my achievement locked", "locked achievement", "unlock badge", "achievement locked"],
    answer: "A locked achievement still needs progress. Check the progress count on the achievement card to see what activity is missing.",
  },
  {
    questions: ["how do i open the memory map", "memory map", "map", "locations map"],
    answer: "Use the Open Memory Map button in the dashboard achievements area, or choose Memory Map from the app navigation.",
  },
  {
    questions: ["how are locations counted", "location count", "locations stat", "mapped places"],
    answer: "The dashboard counts unique saved artifact locations. Empty locations are ignored, and repeated location names count once.",
  },
  {
    questions: ["what are public artifacts", "public artifact", "make artifact public", "shared memories"],
    answer: "Public artifacts are memories marked visible to visitors. Private artifacts stay in your personal museum views only.",
  },
  {
    questions: ["how do i make a memory public", "make memory public", "share artifact", "publish memory"],
    answer: "Open the artifact details or edit form, then enable the public visibility option if it is available for that artifact.",
  },
  {
    questions: ["how do i keep a memory private", "private memory", "hide artifact", "make artifact private"],
    answer: "Leave public visibility off when creating or editing the artifact. Private memories remain available to you after login.",
  },
  {
    questions: ["where are recent artifacts", "recent artifacts", "recent memories", "latest memories"],
    answer: "Recent Artifacts appears near the bottom of the dashboard and shows your newest saved memories.",
  },
  {
    questions: ["why no recent artifacts", "no artifacts", "empty dashboard", "nothing archived"],
    answer: "You have not archived artifacts yet. Create or open an exhibition room, then add your first memory artifact.",
  },
  {
    questions: ["how do i view an artifact", "open artifact", "artifact details", "view memory"],
    answer: "Click an artifact card in Recent Artifacts or browse through an exhibition room to open its full details.",
  },
  {
    questions: ["how do i edit an artifact", "edit memory", "change artifact", "update memory"],
    answer: "Open the artifact details page and look for the edit action. From there you can update the story, date, image, emotion, or location.",
  },
  {
    questions: ["how do i delete an artifact", "delete memory", "remove artifact", "erase memory"],
    answer: "Open the artifact details or management area and use the delete action if your account has permission.",
  },
  {
    questions: ["how do i add an image", "upload image", "artifact photo", "memory photo"],
    answer: "When creating or editing an artifact, add an image URL or upload field if configured. Images make artifacts easier to recognize.",
  },
  {
    questions: ["why image not showing", "broken image", "missing photo", "image error"],
    answer: "Check that the image URL is reachable and saved correctly. If no image is available, the app shows a placeholder icon.",
  },
  {
    questions: ["how do emotions work", "emotion tag", "memory emotion", "add emotion"],
    answer: "Emotion tags help describe the feeling attached to a memory. Add one while creating or editing an artifact.",
  },
  {
    questions: ["how do dates work", "memory date", "artifact date", "date not set"],
    answer: "Artifact dates are shown in a readable month-day-year format. If no date is saved, the dashboard displays Date not set.",
  },
  {
    questions: ["what does total artifacts mean", "total artifacts", "artifact count", "archive count"],
    answer: "Total Artifacts is the number of memories currently saved in your personal archive.",
  },
  {
    questions: ["what does exhibition rooms mean", "exhibition rooms stat", "rooms count", "collection count"],
    answer: "Exhibition Rooms is the number of collections you have created to organize your artifacts.",
  },
  {
    questions: ["what does public artifacts mean", "public artifacts stat", "visible visitors", "visitor visible"],
    answer: "Public Artifacts is the count of saved memories currently visible to visitors.",
  },
  {
    questions: ["what does locations mean", "locations dashboard", "mapped places stat", "places stat"],
    answer: "Locations shows how many unique places are attached to your saved artifacts.",
  },
  {
    questions: ["how do i search", "search dashboard", "find memory", "find artifact"],
    answer: "Use the search in the top navigation if enabled, or browse through your rooms and recent artifacts.",
  },
  {
    questions: ["how do i navigate", "where is menu", "sidebar", "navigation"],
    answer: "Use the sidebar and top navigation to move between Dashboard, Exhibition Rooms, Memory Map, Gallery, and other museum areas.",
  },
  {
    questions: ["how do i login", "login", "sign in", "account access"],
    answer: "Use the login page to sign in with your account. The dashboard loads your museum only after authentication.",
  },
  {
    questions: ["how do i logout", "logout", "sign out", "leave account"],
    answer: "Use the account or navigation sign-out option when available to end your session.",
  },
  {
    questions: ["profile", "my profile", "change profile", "account profile"],
    answer: "Profile details are used for your museum identity. Open Settings or Profile areas if available to update your information.",
  },
  {
    questions: ["settings", "app settings", "account settings", "preferences"],
    answer: "Open Settings from the navigation to manage account preferences and profile-related options.",
  },
  {
    questions: ["dashboard loading", "opening dashboard", "loading stuck", "dashboard not loading"],
    answer: "If the dashboard keeps loading, refresh the page and confirm you are signed in. A connection issue can also delay your museum data.",
  },
  {
    questions: ["dashboard error", "unable to load dashboard", "load error", "error message"],
    answer: "The dashboard error usually means data could not be fetched. Refresh first, then check your connection and account session.",
  },
  {
    questions: ["how is data saved", "where data saved", "storage", "database"],
    answer: "Your museum data is saved through the app services connected to the project backend.",
  },
  {
    questions: ["can visitors see everything", "visitor privacy", "visitor access", "what can visitors see"],
    answer: "Visitors should only see content you make public. Keep sensitive artifacts private.",
  },
  {
    questions: ["how to organize memories", "organize artifacts", "museum organization", "curation tips"],
    answer: "Start with rooms by theme or time period, then add dates, locations, emotions, and images so artifacts are easy to revisit.",
  },
  {
    questions: ["best room names", "collection names", "room ideas", "exhibition ideas"],
    answer: "Good room names include Family Stories, Childhood, Travel, School Days, Celebrations, Letters, Recipes, and Milestones.",
  },
  {
    questions: ["what should i write", "memory story", "artifact description", "writing help"],
    answer: "Write who was there, what happened, when it happened, where it happened, and why the memory still matters.",
  },
  {
    questions: ["short description help", "caption help", "artifact caption", "memory caption"],
    answer: "Use a clear one-sentence caption that names the moment, people, place, and date if you know them.",
  },
  {
    questions: ["family history", "genealogy", "family memories", "family archive"],
    answer: "For family history, group artifacts by relatives, households, places, or generations, then add context to each memory.",
  },
  {
    questions: ["travel memories", "trip memories", "vacation archive", "travel room"],
    answer: "For travel memories, create a room per trip or country and use locations so the Memory Map becomes meaningful.",
  },
  {
    questions: ["school memories", "education memories", "class memories", "graduation"],
    answer: "For school memories, group artifacts by school, year, classmates, clubs, or major events like graduation.",
  },
  {
    questions: ["birthday memories", "celebration memories", "party memories", "anniversary"],
    answer: "For celebrations, include the date, guest names, location, and one detail that made the day memorable.",
  },
  {
    questions: ["recipe memories", "food memories", "family recipes", "cooking memory"],
    answer: "For recipe memories, add the recipe, who made it, when it was served, and any family story connected to it.",
  },
  {
    questions: ["letters", "documents", "scan documents", "old papers"],
    answer: "For letters and documents, add a clear image, date, sender or owner, and a short explanation of why it matters.",
  },
  {
    questions: ["old photos", "photo archive", "scan photos", "photo memories"],
    answer: "For old photos, note names, place, approximate date, and any story behind the image.",
  },
  {
    questions: ["audio memories", "voice memory", "recording", "sound"],
    answer: "If audio support is available, attach or link the recording. Otherwise, write a transcript or summary in the artifact story.",
  },
  {
    questions: ["video memories", "video artifact", "family video", "upload video"],
    answer: "If video support is available, attach or link the video. Otherwise, save a still image and describe the video moment.",
  },
  {
    questions: ["museum", "what is memoirium", "app purpose", "digital museum"],
    answer: "Memoirium helps you build a personal digital museum from memories, artifacts, rooms, places, and stories.",
  },
  {
    questions: ["gallery", "open gallery", "view gallery", "museum gallery"],
    answer: "Use Gallery from the navigation to browse visual museum content in a more image-focused view.",
  },
  {
    questions: ["discover", "discover page", "public museum", "explore"],
    answer: "Use Discover to explore public museum content when that area is available.",
  },
  {
    questions: ["collections", "open collections", "exhibition rooms page", "rooms page"],
    answer: "Open Exhibition Rooms or Collections from the navigation to manage grouped artifacts.",
  },
  {
    questions: ["timeline", "timeline page", "memory timeline", "chronology"],
    answer: "Use Timeline to review memories in chronological order when dates are saved.",
  },
  {
    questions: ["3d museum", "museum 3d", "virtual museum", "three d"],
    answer: "Open the 3D museum view if available to experience your artifacts in a virtual museum space.",
  },
  {
    questions: ["guestbook", "visitor messages", "comments", "visitor notes"],
    answer: "Guestbook features let visitors leave messages when enabled for public museum experiences.",
  },
  {
    questions: ["curator notes", "notes", "private notes", "museum notes"],
    answer: "Curator notes are useful for extra context, research reminders, or background details about an artifact or collection.",
  },
  {
    questions: ["share museum", "museum share", "share link", "public link"],
    answer: "Use sharing options where available to create a public route for visitors to view public content.",
  },
  {
    questions: ["admin", "admin panel", "moderation", "admin access"],
    answer: "Admin areas are only available to authorized admin users for moderation, analytics, museums, and user management.",
  },
  {
    questions: ["mobile", "phone", "responsive", "small screen"],
    answer: "The dashboard is responsive. Use the menu button on smaller screens to open navigation.",
  },
  {
    questions: ["desktop", "large screen", "laptop", "wide screen"],
    answer: "On larger screens, the dashboard shows stats, achievements, and artifacts in wider grids for faster scanning.",
  },
  {
    questions: ["can i ask questions", "help", "what can you do", "chat help"],
    answer: "Ask about adding artifacts, rooms, achievements, public memories, locations, writing tips, privacy, navigation, or dashboard stats.",
  },
  {
    questions: ["are you ai", "local ai", "chatbot", "assistant"],
    answer: "I am a local dashboard assistant with built-in answers for common Memoirium questions. I do not call an external AI service.",
  },
  {
    questions: ["internet", "online ai", "external api", "openai"],
    answer: "This helper uses local built-in responses only. It does not send your chat to an external AI API.",
  },
  {
    questions: ["privacy chatbot", "chat privacy", "chat saved", "conversation saved"],
    answer: "This dashboard helper keeps the conversation in the current page state only. Refreshing the page clears the chat.",
  },
  {
    questions: ["clear chat", "reset chat", "start over", "new chat"],
    answer: "Refresh the dashboard to clear this local chat conversation.",
  },
  {
    questions: ["what questions", "examples", "sample questions", "question ideas"],
    answer: "Try asking: How do I add an artifact? What are exhibition rooms? How do achievements work? How do I make a memory public?",
  },
  {
    questions: ["why 100 questions", "100 questions", "how many questions", "question limit"],
    answer: "I can match around 100 common dashboard and museum questions using local built-in guidance.",
  },
  {
    questions: ["support", "contact support", "need support", "help desk"],
    answer: "For account or technical support, use the project's support channel if one is provided by the app owner.",
  },
  {
    questions: ["bug", "report bug", "problem", "something wrong"],
    answer: "Write down what happened, the page you were on, and any error message. That makes the issue easier to investigate.",
  },
  {
    questions: ["slow", "performance", "lag", "page slow"],
    answer: "Large images or network delays can slow the dashboard. Try refreshing and using optimized image files for artifacts.",
  },
  {
    questions: ["image size", "photo size", "large image", "optimize image"],
    answer: "Use clear but reasonably sized images. Very large photos can slow loading and make browsing less comfortable.",
  },
  {
    questions: ["title help", "artifact title", "name memory", "memory title"],
    answer: "Use a specific title, such as Grandma's Kitchen, Penang Trip 2019, First Day at School, or Father's Watch.",
  },
  {
    questions: ["location help", "place name", "artifact location", "memory location"],
    answer: "Use a recognizable place name such as a city, home, school, landmark, or venue. Consistent spelling improves map grouping.",
  },
  {
    questions: ["duplicate locations", "same location", "location duplicate", "merge places"],
    answer: "Use consistent names for the same place. For example, choose either Kuala Lumpur or KL so the dashboard counts cleanly.",
  },
  {
    questions: ["duplicate artifact", "duplicate memory", "same memory", "copy memory"],
    answer: "If you accidentally create a duplicate, keep the better version and delete or edit the extra one if permissions allow.",
  },
  {
    questions: ["empty collection", "empty room", "room has no artifacts", "collection empty"],
    answer: "An empty room is ready for curation. Open it and add artifacts that belong to that theme.",
  },
  {
    questions: ["collection description", "room description", "describe room", "exhibition text"],
    answer: "Describe the room by explaining the theme, time period, people, or story that connects the artifacts.",
  },
  {
    questions: ["first memory", "start museum", "getting started", "begin"],
    answer: "Start with one room and one artifact. Add a title, image, date, location, emotion, and a short story.",
  },
  {
    questions: ["museum complete", "finish museum", "complete archive", "archive goal"],
    answer: "A museum is never really finished. Build it in passes: key memories first, then add details and missing context later.",
  },
  {
    questions: ["backup", "export", "download data", "save copy"],
    answer: "Use export or download options if the app provides them. Otherwise, keep important images and notes backed up separately.",
  },
  {
    questions: ["delete account", "remove account", "account deletion", "close account"],
    answer: "Check Settings or contact the app owner for account deletion options and data removal requirements.",
  },
  {
    questions: ["change password", "password", "reset password", "forgot password"],
    answer: "Use the authentication flow's password reset option if it is enabled for this project.",
  },
  {
    questions: ["email", "change email", "account email", "login email"],
    answer: "Email changes depend on the authentication settings. Look in Settings or the account management area.",
  },
  {
    questions: ["collaboration", "invite family", "multiple users", "team"],
    answer: "If collaboration is enabled, invite family members through sharing or account features. Otherwise, one account manages its own museum.",
  },
  {
    questions: ["moderation", "public moderation", "review public", "content review"],
    answer: "Public content may be reviewed by admins or moderators depending on the app configuration.",
  },
  {
    questions: ["safe content", "sensitive memory", "private details", "personal data"],
    answer: "Keep sensitive names, addresses, documents, and personal details private unless you are comfortable sharing them.",
  },
  {
    questions: ["accessibility", "alt text", "image description", "screen reader"],
    answer: "Use clear artifact titles and descriptions. They help everyone understand images and memory context.",
  },
  {
    questions: ["keyboard", "keyboard navigation", "tab", "access keys"],
    answer: "Use Tab to move through controls and Enter or Space to activate focused buttons where browser behavior supports it.",
  },
  {
    questions: ["theme", "colors", "dark mode", "appearance"],
    answer: "The dashboard uses the Memoirium theme colors. Appearance options depend on the app settings available in this project.",
  },
  {
    questions: ["navbar", "top bar", "search bar", "top navigation"],
    answer: "The top bar contains dashboard navigation controls such as menu access and search when enabled.",
  },
  {
    questions: ["sidebar open", "open sidebar", "close sidebar", "menu button"],
    answer: "Use the menu button to open the sidebar on smaller screens, then choose a destination or close it.",
  },
  {
    questions: ["button not working", "click not working", "cannot click", "action not working"],
    answer: "Refresh the page and try again. If the issue continues, note the exact button and page so it can be debugged.",
  },
  {
    questions: ["permission", "not allowed", "access denied", "unauthorized"],
    answer: "Access errors usually mean your account lacks permission for that action or your session needs to be refreshed.",
  },
  {
    questions: ["supabase", "backend", "database connection", "auth backend"],
    answer: "This project uses backend services for auth and museum data. If data fails to load, the backend connection may need checking.",
  },
  {
    questions: ["vercel", "netlify", "deploy", "deployment"],
    answer: "Deployment depends on the configured hosting provider. Make sure environment variables and backend URLs are set correctly.",
  },
  {
    questions: ["test account", "demo data", "seed data", "demo museum"],
    answer: "Demo or seed data depends on the project setup. Use documented seed scripts if the app owner provides them.",
  },
  {
    questions: ["museum analytics", "analytics", "stats", "insights"],
    answer: "Dashboard stats summarize your museum activity. Admin analytics may provide broader insight if your account has access.",
  },
  {
    questions: ["memory engagement", "likes", "hearts", "engagement"],
    answer: "Engagement features can track visitor reactions or interactions when enabled for public memories.",
  },
  {
    questions: ["favorite", "favorites", "heart artifact", "like memory"],
    answer: "Heart or favorite features depend on the artifact view. Use them where the interface exposes that action.",
  },
  {
    questions: ["museum share card", "share card", "preview card", "social preview"],
    answer: "Share cards are visual summaries used when presenting or sharing a museum publicly.",
  },
  {
    questions: ["welcome back", "dashboard heading", "why welcome", "home page"],
    answer: "Welcome Back is the dashboard greeting. This page is your main control area for curating memories.",
  },
  {
    questions: ["who can use dashboard", "dashboard access", "protected dashboard", "private dashboard"],
    answer: "The dashboard is for signed-in users. Protected routes keep personal museum management behind authentication.",
  },
  {
    questions: ["museum visitor", "visitor view", "public view", "what visitors see"],
    answer: "Visitor views focus on public museum content, while the dashboard is for managing your private and public artifacts.",
  },
  {
    questions: ["artifact order", "sort memories", "recent order", "memory order"],
    answer: "Recent Artifacts shows a limited set from your loaded memories. Use collections or timeline views for more browsing options.",
  },
  {
    questions: ["how many recent artifacts", "recent limit", "only four", "four artifacts"],
    answer: "The dashboard highlights up to four recent artifacts so the page stays focused and easy to scan.",
  },
  {
    questions: ["can i ask anything", "unknown question", "not answered", "fallback"],
    answer: "I am best with Memoirium dashboard questions. Try asking about artifacts, rooms, achievements, locations, privacy, or writing memories.",
  },
];

const additionalAssistantQuestions: Array<{ questions: string[]; answer: string }> = [
  { questions: ["can i add pdf", "pdf artifact", "upload pdf"], answer: "If PDF upload is enabled, add it through the artifact form. If not, save a cover image and link or summarize the PDF in the artifact story." },
  { questions: ["can i add document", "word document", "doc file"], answer: "Document support depends on the artifact form. You can still archive the document by adding an image, title, date, and description." },
  { questions: ["can i add multiple photos", "many photos", "photo album"], answer: "If the current form only supports one image, choose the strongest image and create related artifacts for the rest." },
  { questions: ["can i add tags", "tag memory", "artifact tags"], answer: "Use tags if the artifact form includes them. Otherwise, include keywords naturally in the title or description." },
  { questions: ["can i rename collection", "rename room", "change room name"], answer: "Open the collection or room management view and use the edit option if your account has permission." },
  { questions: ["can i delete collection", "delete room", "remove exhibition room"], answer: "Use the room management delete action if available. Check whether artifacts inside the room need to be moved first." },
  { questions: ["can i move artifact", "move memory to another room", "change collection"], answer: "Open the artifact edit flow and change its room or collection if that field is available." },
  { questions: ["can i copy artifact", "copy memory", "duplicate artifact"], answer: "If duplication is not built in, create a new artifact and reuse the important details manually." },
  { questions: ["can i archive without photo", "text only memory", "no image artifact"], answer: "Yes. A useful artifact can be text-only if the story, date, people, and place are clear." },
  { questions: ["can i add unknown date", "approximate date", "date unknown"], answer: "If you do not know the exact date, leave it blank or use the closest known date and mention the uncertainty in the story." },
  { questions: ["can i add decade", "only know year", "year only"], answer: "Use the closest supported date field and write the decade or year context in the description." },
  { questions: ["can i add people", "names in memory", "who was there"], answer: "List important people in the artifact story or title so the memory is easier to find later." },
  { questions: ["can i add relationship", "family relation", "relative names"], answer: "Add relationships in the story, such as aunt, grandfather, cousin, or friend, to preserve context." },
  { questions: ["can i add source", "memory source", "where story came from"], answer: "Add the source in the description, especially if the story came from a relative, letter, album, or interview." },
  { questions: ["can i cite source", "citation", "archive citation"], answer: "Use the artifact description for source notes, dates, links, or collection references." },
  { questions: ["can i add interview", "oral history", "interview memory"], answer: "Create an artifact for the interview and include the speaker, date, topic, and summary or transcript." },
  { questions: ["can i add transcript", "transcribe audio", "written transcript"], answer: "Paste the transcript into the story field or attach it as a document if supported." },
  { questions: ["can i add address", "home address", "private address"], answer: "Avoid public addresses in public artifacts. Keep exact private locations out of visitor-visible memories." },
  { questions: ["can i add coordinates", "gps", "latitude longitude"], answer: "Use the location field if it supports precise places. For privacy, public artifacts should usually use general locations." },
  { questions: ["can i hide location", "private location", "remove location"], answer: "Edit the artifact and clear or generalize the location if you do not want it shown or counted." },
  { questions: ["can i change visibility later", "switch public private", "visibility later"], answer: "Yes, edit the artifact and update its public or private visibility if that option is available." },
  { questions: ["can i preview public view", "preview visitor view", "see as visitor"], answer: "Open the public museum or share view to check what visitors can see." },
  { questions: ["what should be public", "what to share", "public content advice"], answer: "Share memories that are meaningful but not sensitive. Keep private documents, exact addresses, and personal details hidden." },
  { questions: ["what should stay private", "sensitive artifacts", "private content advice"], answer: "Keep legal documents, IDs, addresses, private family matters, and sensitive photos private." },
  { questions: ["how to write better stories", "better memory writing", "improve description"], answer: "Use concrete details: names, place, date, emotion, one vivid moment, and why the artifact matters." },
  { questions: ["what details matter", "important memory details", "story details"], answer: "The most useful details are who, what, when, where, why, source, and what changed because of the moment." },
  { questions: ["how long should story be", "description length", "memory length"], answer: "A few clear sentences are enough. Longer stories work well when they add names, context, and meaning." },
  { questions: ["can i write in first person", "first person story", "writing voice"], answer: "Yes. First person feels personal and works well for lived memories." },
  { questions: ["can i write for someone else", "write relative memory", "memory from family"], answer: "Yes. Mention whose memory it is and how you learned the story." },
  { questions: ["how to handle unknown people", "unknown person photo", "unidentified people"], answer: "Write what you know and mark unknown people clearly, such as Unknown man at family picnic, circa 1970." },
  { questions: ["how to handle uncertain facts", "not sure", "maybe date"], answer: "State uncertainty directly. Phrases like likely, around, possibly, or family says preserve accuracy." },
  { questions: ["can i update later", "finish later", "draft memory"], answer: "Yes. Add the artifact now with what you know, then return later to improve it." },
  { questions: ["what is curation", "curate meaning", "curating memories"], answer: "Curation means choosing, organizing, and explaining artifacts so visitors understand the story behind them." },
  { questions: ["how to curate room", "room curation", "curate collection"], answer: "Pick a theme, add the strongest artifacts first, and write descriptions that explain how the memories connect." },
  { questions: ["room too big", "too many artifacts", "split room"], answer: "Split large rooms by time, place, person, or event so visitors can browse without feeling lost." },
  { questions: ["room too small", "few artifacts", "only one memory"], answer: "A small room is fine if the theme is strong. Add more artifacts later as the archive grows." },
  { questions: ["how to choose first room", "first collection idea", "where to begin"], answer: "Start with a room you can finish quickly, such as one trip, one person, or one family event." },
  { questions: ["how to name artifacts", "artifact naming", "good title"], answer: "Use names that are specific and searchable, such as Wedding Day in Ipoh, 1986." },
  { questions: ["bad artifact title", "title too vague", "generic title"], answer: "Avoid vague titles like Photo 1. Include people, place, event, or date when possible." },
  { questions: ["can i use emojis", "emoji title", "emoji memory"], answer: "You can, but clear words are easier to search and understand later." },
  { questions: ["can i use another language", "multilingual memories", "write in malay"], answer: "Yes. Write in the language that best preserves the memory. Add a translation if visitors may need it." },
  { questions: ["translation", "translate story", "bilingual archive"], answer: "Add both original wording and a translation in the description when preserving exact phrasing matters." },
  { questions: ["old handwriting", "hard to read", "handwritten letter"], answer: "Upload a clear image and add a typed transcription or summary so the content remains readable." },
  { questions: ["damaged photo", "torn photo", "faded photo"], answer: "Archive the best scan you have and describe visible details, damage, and any known background." },
  { questions: ["scan quality", "how to scan", "photo scanning"], answer: "Use good light, avoid glare, crop edges cleanly, and keep a backup of the original high-quality scan." },
  { questions: ["phone photo scan", "take photo of photo", "mobile scanning"], answer: "Place the photo flat, use indirect light, keep the camera parallel, and crop only after saving a clean copy." },
  { questions: ["what file type", "image format", "jpg png"], answer: "JPG works well for photos. PNG works well for screenshots, documents, or images with text." },
  { questions: ["upload failed", "cannot upload", "file upload error"], answer: "Check file size, file type, connection, and whether the app currently supports that upload field." },
  { questions: ["save failed", "cannot save", "save error"], answer: "Check required fields and your connection, then retry. If it still fails, note the error message." },
  { questions: ["changes not showing", "update not visible", "saved but missing"], answer: "Refresh the page. If the change still does not appear, confirm it saved successfully and that filters are not hiding it." },
  { questions: ["where did my memory go", "missing memory", "artifact disappeared"], answer: "Check the room it belongs to, recent artifacts, search, and whether you are signed into the correct account." },
  { questions: ["where did my room go", "missing collection", "collection disappeared"], answer: "Check Collections or Exhibition Rooms and confirm you are signed into the account that created it." },
  { questions: ["wrong account", "different account", "not my data"], answer: "Sign out and sign back in with the expected email or authentication provider." },
  { questions: ["session expired", "logged out", "auth expired"], answer: "Sign in again. Sessions can expire for security or browser storage reasons." },
  { questions: ["browser support", "which browser", "recommended browser"], answer: "Use a current version of Chrome, Edge, Firefox, or Safari for the best experience." },
  { questions: ["cache issue", "clear cache", "old version"], answer: "Refresh the page first. If the issue continues, clear site cache or open the app in a private window." },
  { questions: ["offline", "no internet", "work offline"], answer: "This app needs its backend connection for saved museum data. Offline use may not save changes." },
  { questions: ["local chatbot offline", "chat works offline", "assistant offline"], answer: "The helper responses are built into the dashboard, but the rest of the app may still need network access for saved data." },
  { questions: ["chatbot accuracy", "assistant wrong", "wrong answer"], answer: "This helper gives general dashboard guidance. For account-specific issues, check the actual page controls and project docs." },
  { questions: ["chatbot cannot answer", "assistant does not know", "unsupported question"], answer: "Try rephrasing around artifacts, rooms, achievements, locations, privacy, dashboard stats, or writing help." },
  { questions: ["does chat use my data", "chat reads memories", "assistant knows memories"], answer: "The helper does not inspect your private artifact content. It answers from built-in dashboard guidance." },
  { questions: ["can chat create artifact", "assistant add memory", "chat action"], answer: "The helper cannot create artifacts for you. It can guide you to the right page and steps." },
  { questions: ["can chat delete data", "assistant delete", "chat modify"], answer: "No. This helper only replies in the chat panel and does not change your museum data." },
  { questions: ["can chat search my museum", "assistant search", "find with chatbot"], answer: "The helper does not search your saved museum. Use the app's search and browsing tools for that." },
  { questions: ["chat history", "previous chat", "remember chat"], answer: "The chat only remembers messages while the dashboard page stays open." },
  { questions: ["chat on other pages", "assistant everywhere", "chat only dashboard"], answer: "This assistant is intentionally added only to the dashboard page." },
  { questions: ["close chat", "hide assistant", "minimize chat"], answer: "Click the close icon in the chat panel or the floating button to hide the assistant." },
  { questions: ["open chat", "show assistant", "floating button"], answer: "Click the circular button at the bottom-right of the dashboard to open the assistant." },
  { questions: ["send message", "ask question", "submit chat"], answer: "Type your question and press Enter or click the send button." },
  { questions: ["chat on mobile", "mobile assistant", "phone chat"], answer: "The chat panel is sized to fit small screens and opens from the bottom-right floating button." },
  { questions: ["chat overlaps content", "button covers page", "floating chat position"], answer: "The assistant floats above the dashboard so it stays available without changing the page layout." },
  { questions: ["dashboard stats wrong", "wrong counts", "incorrect stats"], answer: "Stats come from loaded memories and collections. Refresh and check whether items are saved under the correct account." },
  { questions: ["achievement progress wrong", "progress incorrect", "badge count wrong"], answer: "Achievement progress is calculated from current profile, collection, and memory data. Refresh after adding new items." },
  { questions: ["recent artifact missing", "not in recent", "recent not updated"], answer: "Recent Artifacts shows only a few items. Open Collections or search to find older or unlisted artifacts." },
  { questions: ["why only recent", "dashboard limited", "not all artifacts"], answer: "The dashboard highlights a summary. Use dedicated pages for full browsing and management." },
  { questions: ["can i sort recent", "change order", "sort artifacts"], answer: "Sorting options depend on the current page. Timeline and collection views are better for ordered browsing." },
  { questions: ["can i filter artifacts", "filter memories", "filter by emotion"], answer: "Use search, collections, map, or timeline views when you need to narrow a larger archive." },
  { questions: ["filter by date", "date filter", "find by year"], answer: "Timeline is the best place to browse by date when memory dates are saved." },
  { questions: ["filter by place", "place filter", "find by location"], answer: "Use the Memory Map or location names to browse memories connected to places." },
  { questions: ["filter by emotion", "emotion filter", "find happy memories"], answer: "If emotion filtering is available, use it. Otherwise, keep emotion words in artifact tags or descriptions." },
  { questions: ["how to use map better", "better memory map", "map tips"], answer: "Add consistent place names to artifacts. The map becomes more useful as more memories include locations." },
  { questions: ["map marker missing", "place not on map", "location not mapped"], answer: "Check that the artifact has a recognizable location and that the map service can resolve it." },
  { questions: ["wrong map place", "location wrong", "map inaccurate"], answer: "Edit the artifact location with a clearer place name, such as city plus country or landmark plus city." },
  { questions: ["country names", "city names", "location format"], answer: "Use specific but readable locations, such as George Town, Penang, Malaysia." },
  { questions: ["home location privacy", "family home privacy", "private home"], answer: "For public memories, use a general city or neighborhood instead of an exact home address." },
  { questions: ["how to make museum emotional", "emotional archive", "meaningful memories"], answer: "Add why the moment matters, not just what happened. Meaning turns records into stories." },
  { questions: ["how to make museum professional", "professional archive", "polished museum"], answer: "Use consistent titles, clean images, accurate dates, clear room themes, and concise descriptions." },
  { questions: ["how to avoid clutter", "declutter archive", "too messy"], answer: "Create focused rooms, remove duplicates, and keep each artifact description clear and specific." },
  { questions: ["memory categories", "archive categories", "types of memories"], answer: "Common categories include people, places, milestones, travel, school, work, recipes, letters, celebrations, and heirlooms." },
  { questions: ["heirloom", "family object", "object memory"], answer: "For heirlooms, photograph the object and explain who owned it, how it was used, and why it was kept." },
  { questions: ["jewelry memory", "ring necklace", "family jewelry"], answer: "Include owner, occasion, material if known, and the story of how the jewelry was passed down." },
  { questions: ["watch memory", "clock artifact", "timepiece"], answer: "Write who used it, when, any repair or gift history, and why it is meaningful." },
  { questions: ["clothing memory", "dress artifact", "uniform"], answer: "Add the event, wearer, date, and any details about the fabric, maker, or occasion." },
  { questions: ["military memory", "service artifact", "uniform medal"], answer: "Record service dates, unit if known, locations, owner, and family context carefully." },
  { questions: ["wedding memory", "wedding archive", "marriage artifact"], answer: "Add names, date, venue, family members present, and one story from the day." },
  { questions: ["baby memory", "childhood artifact", "birth memory"], answer: "Add names, date, place, age, and the family story connected to the moment." },
  { questions: ["work memory", "career artifact", "job memory"], answer: "Include workplace, role, date range, colleagues, achievements, and why the moment mattered." },
  { questions: ["business memory", "company archive", "shop history"], answer: "Add business name, location, dates, people involved, and the story of how it operated." },
  { questions: ["migration story", "moving country", "immigration memory"], answer: "Include origin, destination, date or period, reason for moving, documents, and family impact." },
  { questions: ["house history", "old house", "family home"], answer: "Add address carefully if private, years lived there, residents, photos, and memorable rooms or events." },
  { questions: ["religious memory", "ceremony", "faith artifact"], answer: "Record the ceremony, place, date, people, object, and respectful context." },
  { questions: ["festival memory", "holiday archive", "cultural celebration"], answer: "Add the festival name, year, place, traditions, food, people, and one vivid detail." },
  { questions: ["pet memory", "animal memory", "family pet"], answer: "Create an artifact with the pet's name, dates if known, favorite habits, and a photo." },
  { questions: ["friendship memory", "friends archive", "best friend"], answer: "Include names, where you met, dates, shared events, and what the friendship meant." },
  { questions: ["community memory", "neighborhood story", "local history"], answer: "Record place, people, period, community role, and how the memory connects to local history." },
  { questions: ["award memory", "certificate", "trophy"], answer: "Photograph the award and add the event, date, recipient, organization, and achievement." },
  { questions: ["newspaper clipping", "news article", "press clipping"], answer: "Save a clear image and include publication name, date, headline, people, and context." },
  { questions: ["passport memory", "passport artifact", "travel document"], answer: "Be careful with sensitive document details. Keep private pages private and describe the travel context." },
  { questions: ["id document", "identity document", "sensitive document"], answer: "Avoid making identity documents public. Archive only what is safe and redact sensitive numbers if needed." },
  { questions: ["medical memory", "health document", "hospital memory"], answer: "Keep medical details private unless there is a clear reason to share them. Add respectful context." },
  { questions: ["legal document", "will document", "contract"], answer: "Keep legal documents private and avoid exposing signatures, addresses, or identification numbers." },
  { questions: ["school certificate", "report card", "exam memory"], answer: "Add school name, year, student name, subject or event, and why it is important." },
  { questions: ["sports memory", "team photo", "competition"], answer: "Include team name, event, date, location, result, and teammates if known." },
  { questions: ["music memory", "concert", "instrument"], answer: "Add performer, song or instrument, venue, date, and the feeling or story attached to it." },
  { questions: ["artwork memory", "painting", "drawing"], answer: "Record artist, date, medium, subject, and the story behind the artwork." },
  { questions: ["book memory", "favorite book", "book artifact"], answer: "Add title, author, owner, date or period, and why the book mattered." },
  { questions: ["toy memory", "childhood toy", "old toy"], answer: "Photograph the toy and include owner, age, era, and a favorite story involving it." },
  { questions: ["car memory", "vehicle", "first car"], answer: "Add make, model, year if known, owner, places traveled, and the story connected to it." },
  { questions: ["household item", "kitchen object", "everyday object"], answer: "Everyday objects can be powerful artifacts when you explain who used them and what routine they represent." },
  { questions: ["recipe format", "write recipe", "food artifact format"], answer: "Include ingredients, steps, who made it, when it was served, and any family variation." },
  { questions: ["interview questions", "ask relatives", "family interview"], answer: "Ask about childhood homes, favorite meals, first jobs, migrations, celebrations, objects kept, and stories behind old photos." },
  { questions: ["memory prompts", "prompt ideas", "what to ask family"], answer: "Try prompts about first homes, school days, holidays, family recipes, old friends, work, travel, and turning points." },
  { questions: ["how to verify story", "fact check memory", "verify family story"], answer: "Compare photos, dates, documents, locations, and multiple relatives' accounts. Mark uncertain details clearly." },
  { questions: ["conflicting stories", "family disagreement", "different versions"], answer: "Record both versions respectfully and mention who shared each one if appropriate." },
  { questions: ["sensitive family story", "difficult memory", "hard story"], answer: "Use care with living people and private matters. Keep sensitive stories private unless everyone involved is comfortable." },
  { questions: ["memorial memory", "remember someone", "tribute"], answer: "Create a respectful room or artifact with photos, dates, stories, favorite details, and public visibility only if appropriate." },
  { questions: ["anniversary reminder", "important dates", "milestone dates"], answer: "Use accurate artifact dates so timeline views help surface anniversaries and milestones." },
  { questions: ["timeline wrong order", "wrong chronology", "date order issue"], answer: "Check each artifact date. Items with missing or incorrect dates can appear out of expected order." },
  { questions: ["timezone", "date timezone", "wrong day"], answer: "Date display can depend on browser locale and saved date values. Check the saved date if a day looks wrong." },
  { questions: ["locale", "date format", "month day year"], answer: "The dashboard formats dates using your browser locale settings." },
  { questions: ["language settings", "change language", "app language"], answer: "Language options depend on the app settings currently implemented in this project." },
  { questions: ["notifications", "email notification", "alerts"], answer: "Notification features depend on project configuration. Check Settings if notifications are supported." },
  { questions: ["invite visitor", "share with friend", "send museum"], answer: "Use public sharing options if available, and confirm only intended artifacts are public before sharing." },
  { questions: ["public link not working", "share link broken", "visitor cannot open"], answer: "Check that the museum or artifact is public and that the link was copied correctly." },
  { questions: ["visitor cannot see artifact", "public memory hidden", "shared artifact missing"], answer: "Confirm the artifact is marked public and belongs to a public-facing museum or collection." },
  { questions: ["visitor sees private", "privacy issue", "private shown"], answer: "Immediately change the artifact to private and review public visibility settings." },
  { questions: ["moderator removed", "content removed", "artifact hidden by admin"], answer: "Public content may be moderated. Contact an admin if you think something was removed incorrectly." },
  { questions: ["admin analytics meaning", "analytics dashboard", "admin stats"], answer: "Admin analytics summarize platform-level usage and are separate from your personal dashboard stats." },
  { questions: ["admin users", "user management", "manage users"], answer: "Admin user tools are only for authorized administrators." },
  { questions: ["admin museums", "manage museums", "museum admin"], answer: "Admin museum tools help authorized admins review and manage museum records." },
  { questions: ["admin moderation queue", "review queue", "moderation queue"], answer: "Moderation queues help admins review public content that may need approval or action." },
  { questions: ["environment variables", "env setup", "supabase keys"], answer: "Deployment and local setup need the required environment variables for auth and data services." },
  { questions: ["local development", "run locally", "dev server"], answer: "Run the project dev script and make sure backend environment variables are configured." },
  { questions: ["production build", "build app", "vite build"], answer: "Use the build script to create the production bundle. Fix type or environment issues before deploying." },
  { questions: ["blank page", "white screen", "app blank"], answer: "Check browser console errors, environment variables, route configuration, and whether the build completed successfully." },
  { questions: ["console error", "browser error", "developer console"], answer: "Console errors can reveal missing environment variables, failed network requests, or broken component code." },
  { questions: ["network error", "request failed", "fetch failed"], answer: "Check your connection, backend URL, Supabase configuration, and whether the service is reachable." },
  { questions: ["database permission", "row level security", "rls"], answer: "Permission problems can come from database policies. Confirm the signed-in user is allowed to read or write that record." },
  { questions: ["profile not found", "missing profile", "no profile"], answer: "The dashboard needs profile data. If it is missing, the profile setup or auth helper may need to run." },
  { questions: ["collection service", "memory service", "service error"], answer: "Service errors usually come from backend reads or writes. Check the specific error message and related service file." },
  { questions: ["achievement service", "badge service", "achievement calculation"], answer: "Achievements are calculated locally from profile, collection, and memory data loaded into the dashboard." },
  { questions: ["data refresh", "refresh stats", "reload dashboard"], answer: "Refresh the page to reload profile, collections, memories, stats, and achievement progress." },
  { questions: ["auto save", "autosave", "save automatically"], answer: "Assume changes save only when you submit the form unless the page clearly shows autosave behavior." },
  { questions: ["required fields", "must fill", "form required"], answer: "Fill required fields such as title or collection before saving. Optional fields can be completed later." },
  { questions: ["form validation", "invalid form", "field error"], answer: "Read the field message and check missing required information, invalid URLs, or unsupported values." },
  { questions: ["image url", "photo url", "external image link"], answer: "Use a direct image URL when supported. Some sharing links are web pages, not actual image files." },
  { questions: ["broken external link", "link not loading", "image hotlink"], answer: "Some hosts block direct image loading. Use a reliable image source or supported upload flow." },
  { questions: ["copyright", "photo rights", "can i upload"], answer: "Upload or share content you own or have permission to use, especially for public artifacts." },
  { questions: ["consent", "permission from family", "share family photo"], answer: "Get consent before making photos or personal stories public, especially when living people are involved." },
  { questions: ["children privacy", "kids photos", "minor privacy"], answer: "Be extra careful with children's photos and details. Keep them private unless sharing is clearly appropriate." },
  { questions: ["redact", "hide details", "blur information"], answer: "Before making sensitive documents public, remove or blur private numbers, addresses, signatures, and contact details." },
  { questions: ["archive strategy", "long term archive", "preserve memories"], answer: "Keep original files backed up, add clear metadata, and organize the museum in small consistent passes." },
  { questions: ["metadata", "memory metadata", "artifact metadata"], answer: "Useful metadata includes title, date, location, people, source, rights, room, emotion, and description." },
  { questions: ["minimum metadata", "must have details", "basic artifact info"], answer: "At minimum, add a specific title and a short description. Date, location, and people make it much stronger." },
  { questions: ["bulk upload", "many memories at once", "import memories"], answer: "Bulk import depends on app features. If unavailable, add high-priority artifacts first and continue in batches." },
  { questions: ["csv import", "spreadsheet import", "import data"], answer: "CSV import is only possible if the project implements it. Otherwise, use the normal artifact form." },
  { questions: ["export public museum", "download museum", "export archive"], answer: "Export features depend on the app. Keep separate backups of important source files regardless." },
  { questions: ["print museum", "print memory", "make book"], answer: "Use browser print or export features if available. For a book, organize artifacts by room or timeline first." },
  { questions: ["presentation", "show family", "family reunion"], answer: "Create focused rooms and make selected artifacts public or present them from the dashboard or gallery." },
  { questions: ["museum tour", "guided tour", "tour overlay"], answer: "Use any guided tour feature available in the app to introduce visitors to key museum areas." },
  { questions: ["audio control", "museum audio", "sound control"], answer: "Use the museum audio control where available to manage sound in immersive views." },
  { questions: ["3d performance", "3d slow", "museum 3d lag"], answer: "3D views can be heavier than dashboard pages. Close other tabs or use a modern device for smoother rendering." },
  { questions: ["memory details page", "details page", "artifact page"], answer: "The details page shows the full artifact story and available actions for that memory." },
  { questions: ["collection details page", "room details", "collection page"], answer: "A collection details page shows artifacts grouped inside one exhibition room." },
  { questions: ["landing page", "home landing", "public homepage"], answer: "The landing page introduces the app, while the dashboard is where signed-in users manage their museum." },
  { questions: ["privacy policy", "privacy page", "data policy"], answer: "Open Privacy Policy to review how the app describes privacy and data handling." },
  { questions: ["not found", "404", "page missing"], answer: "A Not Found page means the route does not exist or the link is incorrect." },
  { questions: ["protected route", "route protected", "login required"], answer: "Protected routes require a signed-in user before showing private dashboard content." },
  { questions: ["admin route", "admin only", "not admin"], answer: "Admin routes are limited to accounts marked as administrators." },
  { questions: ["button style", "why gold", "gold color"], answer: "The dashboard uses Memoirium's museum-like theme, with gold accents for important actions and highlights." },
  { questions: ["card hover", "click cards", "artifact card"], answer: "Clickable cards open related details, such as an artifact page or a collection view." },
  { questions: ["loading message", "opening museum dashboard", "dashboard spinner"], answer: "The loading message appears while the dashboard fetches profile, collection, and memory data." },
  { questions: ["error recovery", "recover from error", "try again"], answer: "Refresh the page, confirm your session, and retry the action. Save the error text if it continues." },
  { questions: ["best next step", "what now", "next action"], answer: "If you are new, create one exhibition room, add three meaningful artifacts, then add dates and locations." },
  { questions: ["dashboard overview", "explain dashboard", "what is on dashboard"], answer: "The dashboard summarizes your artifact count, rooms, public items, locations, achievements, and recent artifacts." },
  { questions: ["museum quality checklist", "archive checklist", "check my museum"], answer: "Check for specific titles, clear images, dates, locations, people, source notes, privacy settings, and room organization." },
  { questions: ["before sharing checklist", "sharing checklist", "public checklist"], answer: "Before sharing, review public visibility, remove sensitive details, check images, and open the visitor view." },
  { questions: ["family archive workflow", "workflow", "archive process"], answer: "Gather materials, scan images, create rooms, add artifacts, write context, verify details, then share selected public items." },
  { questions: ["how many rooms should i make", "number of rooms", "too many rooms"], answer: "Use enough rooms to make browsing clear. Start small, then split rooms when a theme gets crowded." },
  { questions: ["how many artifacts per room", "room size", "artifact per collection"], answer: "There is no fixed number. A focused room with 5 to 20 strong artifacts is often easier to browse." },
  { questions: ["can i add future memories", "new memories", "ongoing archive"], answer: "Yes. Keep adding new artifacts as life happens so the museum grows over time." },
  { questions: ["can i archive today", "today memory", "current memory"], answer: "Yes. Add current memories with today's date and enough context for future readers." },
  { questions: ["oldest memory", "early memory", "first childhood memory"], answer: "For very old memories, add approximate dates and explain what is remembered versus what was later learned." },
  { questions: ["memory confidence", "confidence level", "certain uncertain"], answer: "Mention confidence in the description when facts are uncertain, especially dates, names, and places." },
  { questions: ["who owns memory", "ownership", "memory owner"], answer: "Use the description to note the person, family, or source connected to the artifact." },
  { questions: ["public museum quality", "visitor experience", "better visitor view"], answer: "Visitors benefit from clear room names, strong cover images, concise stories, and only polished public artifacts." },
  { questions: ["dashboard assistant purpose", "why chatbot", "assistant purpose"], answer: "This assistant gives quick local help so users can understand the dashboard without leaving the page." },
];

const expandedAssistantQuestions: Array<{ questions: string[]; answer: string }> = [
  { questions: ["how do i add my first photo", "first photo upload", "start with photo"], answer: "Create or open an exhibition room, then add an artifact with the photo, a specific title, and a short story." },
  { questions: ["how do i add my first story", "first story", "start with story"], answer: "Begin with a memory you can explain clearly. Add who was involved, what happened, when, where, and why it matters." },
  { questions: ["how do i add family member", "family member profile", "relative profile"], answer: "If people profiles are not available, include family member names and relationships inside artifact descriptions." },
  { questions: ["can i tag relatives", "tag family", "tag people"], answer: "Use people tags if the app supports them. Otherwise, write names consistently in the artifact title or description." },
  { questions: ["can i tag events", "event tags", "tag occasion"], answer: "If event tags are unavailable, create a room for the event or include the event name in each artifact title." },
  { questions: ["can i tag years", "year tags", "tag by year"], answer: "Save artifact dates where possible. Timeline browsing works better than manual year tags." },
  { questions: ["can i tag places", "place tags", "tag location"], answer: "Use the location field for places. Consistent place names make maps and counts more useful." },
  { questions: ["can i upload from phone", "phone upload", "mobile upload"], answer: "Use the dashboard on your phone and add artifacts through the normal form if uploads are enabled." },
  { questions: ["can i upload from computer", "desktop upload", "pc upload"], answer: "Use the artifact form from your browser and choose a file or image URL depending on the configured field." },
  { questions: ["can i use camera", "take photo", "camera upload"], answer: "If your browser and form support camera capture, use it. Otherwise, take the photo first and upload or link it." },
  { questions: ["can i rotate image", "rotate photo", "image sideways"], answer: "If rotation is not available in the app, rotate the image before uploading or use a corrected image file." },
  { questions: ["can i crop image", "crop photo", "image crop"], answer: "Crop the image before uploading if the artifact form does not include built-in cropping." },
  { questions: ["can i replace image", "change artifact image", "update photo"], answer: "Open the artifact edit flow and replace the image URL or uploaded image if that field is editable." },
  { questions: ["can i remove image", "delete photo from artifact", "clear image"], answer: "Edit the artifact and clear the image field if the app allows image removal." },
  { questions: ["can i add cover image", "room cover", "collection cover"], answer: "Use the collection edit options if cover images are supported. Otherwise, the app may use artifact images as visual previews." },
  { questions: ["can i change cover image", "change room cover", "update collection cover"], answer: "Open the room edit view and update the cover image if that field exists." },
  { questions: ["can i add room description", "room intro", "collection intro"], answer: "Yes, if the room form supports descriptions. Explain the theme and why the room exists." },
  { questions: ["can i edit room description", "update room intro", "change collection description"], answer: "Open the room management or edit view, then update the description field if available." },
  { questions: ["can i reorder rooms", "sort rooms", "room order"], answer: "Room ordering depends on the app features. Use clear names if manual ordering is not available." },
  { questions: ["can i reorder artifacts", "arrange memories", "artifact order in room"], answer: "Manual artifact ordering depends on the room view. Dates and titles help create a natural browsing order." },
  { questions: ["can i pin artifact", "featured memory", "highlight artifact"], answer: "If pinning is not available, place important artifacts in a focused room or give them clear titles." },
  { questions: ["can i feature room", "featured room", "highlight collection"], answer: "Feature controls depend on the app. Strong room names and cover images still help important rooms stand out." },
  { questions: ["can i add museum title", "museum name", "rename museum"], answer: "Museum naming depends on profile or settings fields. Check Settings for editable museum identity options." },
  { questions: ["can i change museum name", "change dashboard name", "update museum title"], answer: "Open Settings or profile options and update the museum name if the field is available." },
  { questions: ["can i add bio", "museum bio", "profile bio"], answer: "Use profile or settings fields if available. A short bio helps visitors understand the person or family behind the museum." },
  { questions: ["can i change avatar", "profile picture", "user photo"], answer: "Open Settings or profile options and update the profile image if supported." },
  { questions: ["can i remove avatar", "delete profile photo", "clear profile picture"], answer: "Profile image removal depends on the Settings page options." },
  { questions: ["can i change username", "username", "display name"], answer: "Check Settings for display name or username fields. Auth email and display name may be separate." },
  { questions: ["can i use nickname", "nickname", "preferred name"], answer: "Use the display name or bio field if available, or write the preferred name in museum descriptions." },
  { questions: ["can i add social links", "instagram link", "website link"], answer: "Social link support depends on profile settings. Keep visitor-facing links appropriate for public sharing." },
  { questions: ["can i remove social links", "delete website link", "clear links"], answer: "Open Settings or profile edit options and remove the link if the field exists." },
  { questions: ["can i customize theme", "change theme color", "custom colors"], answer: "Theme customization depends on app settings. The dashboard currently follows the Memoirium theme." },
  { questions: ["can i change font", "custom font", "font settings"], answer: "Font customization depends on project settings and is not usually controlled from the dashboard." },
  { questions: ["can i use light mode", "light theme", "bright mode"], answer: "Light mode depends on whether the project includes theme switching." },
  { questions: ["can i use dark mode", "dark theme", "night mode"], answer: "The dashboard already uses a dark museum-style theme unless the app provides other appearance settings." },
  { questions: ["can i change layout", "dashboard layout", "custom dashboard"], answer: "Dashboard layout is fixed by the app. Use rooms, dates, locations, and titles to shape the content." },
  { questions: ["can i hide stats", "remove stats", "dashboard cards"], answer: "Hiding dashboard stats is not currently a built-in chat action. Settings would need to support that feature." },
  { questions: ["can i hide achievements", "remove achievements", "turn off badges"], answer: "Achievements are part of the dashboard summary. Hiding them would require a settings or code change." },
  { questions: ["can i hide recent artifacts", "remove recent artifacts", "hide recent"], answer: "Recent Artifacts is a dashboard section. Use privacy settings for artifacts, but hiding the section requires an app change." },
  { questions: ["can i hide chatbot", "disable chatbot", "remove assistant"], answer: "You can close the assistant with the close button. Removing it entirely would require a code change." },
  { questions: ["can i make chatbot bigger", "bigger chat", "resize chat"], answer: "The chat panel uses a fixed responsive size. Resizing would require a small UI change." },
  { questions: ["can i make chatbot smaller", "smaller chat", "compact chat"], answer: "The panel is already responsive. A more compact mode would need a design change." },
  { questions: ["can i move chat button", "move assistant", "chat position"], answer: "The assistant is fixed at the bottom-right of the dashboard. Moving it would require a code change." },
  { questions: ["can i change chat color", "assistant color", "chat theme"], answer: "The assistant follows the dashboard gold and dark theme. Color changes would be a UI update." },
  { questions: ["can i change chat name", "assistant name", "bot name"], answer: "The chat title is currently Memoirium Assistant. Renaming it would require editing the dashboard component." },
  { questions: ["can i add chatbot avatar", "bot avatar", "assistant icon"], answer: "The assistant uses a sparkle icon now. A custom avatar can be added with a UI change." },
  { questions: ["can i use ai model", "real ai chatbot", "smart ai"], answer: "This assistant is local and rule-based. A real AI model would require an external or self-hosted AI service." },
  { questions: ["can i connect openai", "openai chatbot", "api chatbot"], answer: "That would require adding an API integration. The current assistant does not use OpenAI or any external API." },
  { questions: ["can i connect tawk", "tawk to", "live chat"], answer: "The current widget is styled like a support chat but is local only. Real Tawk.to live chat would require adding their script." },
  { questions: ["can i talk to human", "human support", "live agent"], answer: "This assistant is not connected to a human agent. Use the project's support channel if one exists." },
  { questions: ["can chatbot answer account billing", "billing question", "payment question"], answer: "Billing questions depend on the app owner or payment provider. This local assistant can only give general dashboard help." },
  { questions: ["subscription", "paid plan", "free plan"], answer: "Plan and subscription details depend on how the app owner configured Memoirium." },
  { questions: ["storage limit", "upload limit", "space limit"], answer: "Storage limits depend on the backend and hosting configuration. Check project documentation or admin settings." },
  { questions: ["file size limit", "max upload size", "large file failed"], answer: "Maximum file size depends on the upload service. Compress large images or use smaller files if uploads fail." },
  { questions: ["how secure is app", "security", "safe account"], answer: "Security depends on authentication, database policies, hosting, and user privacy choices. Keep sensitive artifacts private." },
  { questions: ["two factor", "2fa", "mfa"], answer: "Two-factor authentication depends on the configured auth provider and project settings." },
  { questions: ["email verification", "verify email", "confirmation email"], answer: "Email verification depends on the auth provider. Check your inbox and spam folder for verification messages." },
  { questions: ["confirmation email missing", "no email received", "email not sent"], answer: "Check spam, confirm the email address, wait a few minutes, or request another email if the login flow supports it." },
  { questions: ["magic link", "email link login", "login link"], answer: "If magic links are enabled, use the emailed link quickly before it expires." },
  { questions: ["oauth login", "google login", "social login"], answer: "Social login options depend on the authentication providers configured for the project." },
  { questions: ["password strength", "strong password", "password advice"], answer: "Use a long unique password and avoid reusing passwords from other sites." },
  { questions: ["forgot email", "lost login email", "which email"], answer: "Try the email addresses you commonly use or contact the app owner if account recovery is needed." },
  { questions: ["account locked", "locked out", "cannot access account"], answer: "Use the reset flow if available or contact support/admin with the account email and issue details." },
  { questions: ["browser storage", "local storage", "cookies"], answer: "Authentication often uses browser storage or cookies. Clearing them can sign you out." },
  { questions: ["incognito", "private window", "private browsing"], answer: "Private windows can help test cache or cookie issues, but you may need to sign in again." },
  { questions: ["multiple tabs", "open in tabs", "same account tabs"], answer: "Multiple tabs can work, but refresh if one tab shows stale dashboard data after edits in another tab." },
  { questions: ["refresh after save", "need refresh", "stale data"], answer: "Some pages may need a refresh or navigation back to show newly saved backend data." },
  { questions: ["loading slow first time", "first load slow", "cold start"], answer: "First loads can be slower if assets, backend services, or hosting functions need to wake up." },
  { questions: ["deployment env missing", "missing env", "environment problem"], answer: "Missing environment variables can break auth, database calls, and public routes after deployment." },
  { questions: ["supabase url", "supabase anon key", "api keys"], answer: "Supabase URL and anon key must be configured in the environment for frontend data access." },
  { questions: ["do not expose secret", "service role key", "secret key"], answer: "Never expose service role or private backend secrets in frontend code." },
  { questions: ["row policy", "rls policy", "policy error"], answer: "Database row policies must allow the signed-in user to perform the intended read or write." },
  { questions: ["owner id", "user id", "record owner"], answer: "Museum records usually need to be tied to the signed-in user's ID for private access control." },
  { questions: ["profile setup error", "profile helper", "auth helper"], answer: "If a profile is missing, check the profile creation helper or database trigger used during signup." },
  { questions: ["seed demo", "demo sql", "sample data"], answer: "Demo data can be loaded only if the project seed scripts are run against the intended database." },
  { questions: ["admin email", "admin user email", "make admin"], answer: "Admin access is usually granted by configured admin email records or database roles." },
  { questions: ["remove admin", "revoke admin", "admin permissions"], answer: "Only authorized maintainers should change admin access in the database or admin configuration." },
  { questions: ["analytics not showing", "empty analytics", "admin analytics empty"], answer: "Analytics may be empty if there is no tracked activity or the admin account lacks access." },
  { questions: ["moderation not showing", "empty moderation", "no moderation items"], answer: "A blank moderation queue usually means there are no pending public content items." },
  { questions: ["museum public route", "public museum url", "museum slug"], answer: "Public routes depend on how the project creates museum URLs or profile slugs." },
  { questions: ["slug", "custom url", "museum url name"], answer: "Custom slugs depend on profile settings and must be unique if the app supports them." },
  { questions: ["slug taken", "url taken", "name unavailable"], answer: "Choose a different public URL slug if the one you want is already used." },
  { questions: ["invalid url", "bad link", "url format"], answer: "Use simple lowercase words, numbers, or hyphens for slugs if the app supports custom URLs." },
  { questions: ["public discover listing", "appear in discover", "listed publicly"], answer: "Public listing depends on whether your museum and artifacts are marked public and approved if moderation exists." },
  { questions: ["hide from discover", "unlist museum", "remove public listing"], answer: "Set content private or disable public listing if that setting is available." },
  { questions: ["visitor engagement", "visitor reactions", "public reactions"], answer: "Engagement features can show likes, hearts, notes, or interactions when implemented on public pages." },
  { questions: ["guestbook spam", "spam comments", "bad guestbook message"], answer: "Use moderation or delete controls if available, and report persistent spam to an admin." },
  { questions: ["delete guestbook", "remove guestbook message", "guestbook moderation"], answer: "Guestbook message deletion depends on owner or admin controls." },
  { questions: ["edit guestbook", "change guestbook message", "fix comment"], answer: "Guestbook editing depends on the feature. If unavailable, remove and repost the message if allowed." },
  { questions: ["curator note public", "are notes public", "note visibility"], answer: "Check the note feature's visibility. If uncertain, do not put sensitive details in notes." },
  { questions: ["curator note private", "private curator notes", "hidden notes"], answer: "Use curator notes for private research context only if the app marks them private." },
  { questions: ["add research note", "research context", "archive note"], answer: "Use notes or the artifact description to record research details, sources, and follow-up questions." },
  { questions: ["todo in archive", "archive task", "follow up"], answer: "Add a short note in the description, such as Needs date confirmation or Ask aunt about names." },
  { questions: ["missing names", "unknown names", "identify people"], answer: "Add what you know now, then update the artifact when someone identifies the people." },
  { questions: ["ask older relatives", "elder interview", "interview grandparent"], answer: "Ask open questions, record dates, and let them describe photos or objects in their own words." },
  { questions: ["record consent", "permission to record", "interview consent"], answer: "Ask permission before recording or sharing an interview, especially for public use." },
  { questions: ["audio transcript privacy", "private transcript", "share transcript"], answer: "Treat transcripts like personal stories. Keep sensitive or private parts out of public artifacts." },
  { questions: ["photo consent", "people in photo", "share photo consent"], answer: "For public photos, consider whether living people would be comfortable with the image and story being shared." },
  { questions: ["deceased person privacy", "share deceased", "memorial privacy"], answer: "Be respectful with memorial content and consider family expectations before making it public." },
  { questions: ["cultural sensitivity", "sacred item", "sensitive tradition"], answer: "Use respectful descriptions and avoid public sharing of restricted or sacred materials unless appropriate." },
  { questions: ["community archive ethics", "ethical archive", "responsible sharing"], answer: "Share with consent, credit sources, avoid exposing private details, and represent stories carefully." },
  { questions: ["credit photographer", "photo credit", "image credit"], answer: "Add photographer or source credit in the description when known." },
  { questions: ["unknown photographer", "photo source unknown", "no credit"], answer: "Write source unknown or from family album if that is the best available information." },
  { questions: ["source from whatsapp", "whatsapp photo", "sent by relative"], answer: "Mention who sent it and when if useful, then add any known original context." },
  { questions: ["source from facebook", "facebook photo", "social media source"], answer: "Record the source and avoid reposting content publicly unless you have permission." },
  { questions: ["source from album", "family album", "album source"], answer: "Mention the album name, owner, page, or household if known." },
  { questions: ["source from box", "old box", "found items"], answer: "Record where the item was found, who owned the box, and any labels or clues." },
  { questions: ["scan labels", "back of photo", "photo back"], answer: "Photograph or transcribe writing on the back of photos because it often contains dates and names." },
  { questions: ["front and back", "two images", "photo reverse"], answer: "If only one image is supported, create two related artifacts or include the back text in the description." },
  { questions: ["negative film", "slides", "film archive"], answer: "Digitize film or slides with proper scanning, then add date, subject, and source notes." },
  { questions: ["digital photos", "modern photos", "phone gallery"], answer: "Choose meaningful images instead of uploading everything. Add context so future readers know why each photo matters." },
  { questions: ["screenshots", "chat screenshots", "digital memory"], answer: "Screenshots can be artifacts, but remove private contact details before making them public." },
  { questions: ["email memory", "old email", "email archive"], answer: "Summarize or screenshot important emails carefully, avoiding private addresses or sensitive text in public artifacts." },
  { questions: ["text message memory", "sms archive", "chat memory"], answer: "Archive message memories only with consent and be careful with private conversation details." },
  { questions: ["social post memory", "old post", "post archive"], answer: "Save the context, date, platform, author, and why the post mattered." },
  { questions: ["digital file organization", "folders", "source files"], answer: "Keep source files in organized folders outside the app too, with names that match museum artifacts when possible." },
  { questions: ["backup photos", "photo backup", "source backup"], answer: "Keep original photos backed up separately before compressing or editing images for the app." },
  { questions: ["cloud backup", "google drive backup", "onedrive backup"], answer: "Cloud backups can protect source files, but keep privacy and account access in mind." },
  { questions: ["external hard drive", "local backup", "offline backup"], answer: "An offline backup is useful for long-term preservation, especially for original scans and important documents." },
  { questions: ["naming files", "file names", "photo file name"], answer: "Use names like 1986-wedding-ipoh-grandparents.jpg instead of IMG_0001.jpg when possible." },
  { questions: ["file naming format", "archive file names", "consistent names"], answer: "A good format is year-event-place-person, using lowercase words and hyphens." },
  { questions: ["duplicates in files", "duplicate photos", "same photo twice"], answer: "Keep the clearest original and archive only the version that tells the story best." },
  { questions: ["restore deleted", "undo delete", "recover artifact"], answer: "Recovery depends on backend and backup features. Be careful before deleting artifacts." },
  { questions: ["undo edit", "revert changes", "old version"], answer: "Version history depends on app features. Keep source notes backed up if revisions matter." },
  { questions: ["version history", "history of edits", "audit trail"], answer: "Edit history is only available if the project implements version tracking." },
  { questions: ["draft mode", "unpublished artifact", "save as draft"], answer: "If drafts are unavailable, keep the artifact private until it is ready to share." },
  { questions: ["publish later", "schedule publish", "delayed sharing"], answer: "Scheduling depends on app features. You can keep items private and make them public later manually." },
  { questions: ["public approval", "approval pending", "waiting moderation"], answer: "If moderation is enabled, public content may need admin approval before visitors see it." },
  { questions: ["rejected content", "not approved", "moderation rejected"], answer: "Review the content for privacy, safety, or policy issues and contact an admin if needed." },
  { questions: ["content guidelines", "sharing rules", "public rules"], answer: "Public artifacts should be respectful, accurate, and safe to share." },
  { questions: ["can i share sad memories", "grief memory", "difficult story public"], answer: "Yes, but use care. Make it public only if the tone is respectful and privacy is protected." },
  { questions: ["can i share conflict", "family conflict", "controversial story"], answer: "Keep conflict private unless there is clear consent and a strong reason to share it publicly." },
  { questions: ["can i share political memory", "political artifact", "campaign memory"], answer: "You can archive it, but public sharing should include context and avoid exposing private people unfairly." },
  { questions: ["can i share religious item", "faith object public", "religious artifact public"], answer: "Share respectfully and consider whether the item or ceremony should remain private." },
  { questions: ["can i share school photo", "class photo public", "student photo"], answer: "Be careful with photos of minors or classmates. Keep it private unless sharing is appropriate." },
  { questions: ["can i share workplace photo", "office photo public", "coworker photo"], answer: "Avoid exposing coworkers, clients, internal documents, or workplace information without permission." },
  { questions: ["can i share address document", "address visible", "document privacy"], answer: "Do not make documents with addresses public unless the sensitive details are removed." },
  { questions: ["can i share phone number", "phone visible", "contact details"], answer: "Remove phone numbers and personal contact details before public sharing." },
  { questions: ["can i share email address", "email visible", "contact privacy"], answer: "Avoid showing private email addresses in public artifacts." },
  { questions: ["can i share signature", "signature visible", "signed document"], answer: "Avoid public signatures. Redact or keep the artifact private." },
  { questions: ["can i share id number", "id visible", "document number"], answer: "Never publish ID numbers, passport numbers, or other sensitive identifiers." },
  { questions: ["can i share license plate", "plate number", "vehicle privacy"], answer: "Consider blurring license plates before making vehicle photos public." },
  { questions: ["can i share location of grave", "grave location", "cemetery privacy"], answer: "Share cemetery locations respectfully and consider family preferences." },
  { questions: ["can i add cemetery", "memorial place", "grave memory"], answer: "Add the place, dates, person remembered, and a respectful story or tribute." },
  { questions: ["can i add donation", "charity memory", "fundraiser"], answer: "Record the cause, date, people involved, and why the event mattered." },
  { questions: ["can i add volunteer memory", "community service", "volunteer artifact"], answer: "Include organization, role, dates, place, and the impact or story behind the service." },
  { questions: ["can i add award ceremony", "ceremony award", "recognition event"], answer: "Add recipient, award name, organization, date, venue, and what the recognition meant." },
  { questions: ["can i add graduation", "graduation artifact", "convocation"], answer: "Include graduate name, school, program, date, venue, and family members present." },
  { questions: ["can i add exam result", "result slip", "grades"], answer: "Keep sensitive academic records private unless there is a clear reason to share them." },
  { questions: ["can i add certificate", "certificate artifact", "achievement certificate"], answer: "Photograph the certificate and add recipient, issuer, date, and why it was earned." },
  { questions: ["can i add diploma", "degree artifact", "university certificate"], answer: "Add institution, program, date, recipient, and the story around the achievement." },
  { questions: ["can i add invitation", "wedding invitation", "event invitation"], answer: "Archive the invitation with event name, date, hosts, place, and related memories." },
  { questions: ["can i add ticket", "ticket stub", "concert ticket"], answer: "Add event name, date, venue, who attended, and a short memory from the event." },
  { questions: ["can i add receipt", "old receipt", "purchase record"], answer: "Receipts can show everyday history. Add item, shop, date, price, and why it matters." },
  { questions: ["can i add map", "paper map", "travel map"], answer: "Add a clear image and explain the trip, route, date, and people involved." },
  { questions: ["can i add postcard", "postcard artifact", "postcard memory"], answer: "Record sender, recipient, date, place, message summary, and travel context." },
  { questions: ["can i add stamp", "stamp collection", "postal artifact"], answer: "Include country, date if known, source, and why the stamp was kept." },
  { questions: ["can i add coin", "coin artifact", "old money"], answer: "Record country, year, owner, how it was acquired, and any family story connected to it." },
  { questions: ["can i add banknote", "old currency", "money artifact"], answer: "Add country, denomination, period, source, and why it was saved." },
  { questions: ["can i add medal", "medal artifact", "military medal"], answer: "Include recipient, award name, date, organization, and context. Keep sensitive service details private if needed." },
  { questions: ["can i add trophy", "sports trophy", "award trophy"], answer: "Photograph the trophy and add event, date, recipient, result, and team or organization." },
  { questions: ["can i add plaque", "commemorative plaque", "recognition plaque"], answer: "Add inscription, date, recipient, location, and the reason it was awarded." },
  { questions: ["can i add notebook", "diary", "journal"], answer: "Diaries and journals can be sensitive. Keep private excerpts private and summarize carefully for public artifacts." },
  { questions: ["can i add poem", "poetry", "written poem"], answer: "Record author, date, context, and whether the poem can be shared publicly." },
  { questions: ["can i add song", "family song", "lyrics memory"], answer: "Describe the song, who sang it, when, and why it mattered. Avoid posting copyrighted lyrics publicly." },
  { questions: ["can i add prayer", "family prayer", "religious text"], answer: "Add context, speaker or source, occasion, and share respectfully." },
  { questions: ["can i add craft", "handmade item", "knitting"], answer: "Photograph the item and include maker, date, material, purpose, and story." },
  { questions: ["can i add furniture", "old chair", "family table"], answer: "Include owner, household, period, use, and memories connected to the object." },
  { questions: ["can i add tool", "work tool", "old tools"], answer: "Record owner, trade or use, date range, and any work stories attached to the tool." },
  { questions: ["can i add machine", "sewing machine", "old appliance"], answer: "Add owner, model if known, period used, repairs, and family stories." },
  { questions: ["can i add recipe video", "cooking video", "food video"], answer: "If video is unsupported, save a still image and write the recipe or story in the description." },
  { questions: ["can i add voice note", "voice message", "whatsapp audio"], answer: "If audio upload is not supported, write a transcript and note who recorded it and when." },
  { questions: ["can i add location photo", "place photo", "landmark memory"], answer: "Add the place name, date, people present, and why the location mattered." },
  { questions: ["can i add map screenshot", "google map screenshot", "route screenshot"], answer: "Use it only if appropriate and add route, trip, date, and context in the description." },
  { questions: ["can i add family tree", "genealogy tree", "ancestry chart"], answer: "Archive the image or document and explain sources, names, dates, and uncertain branches." },
  { questions: ["can i add ancestry dna", "dna result", "genetic data"], answer: "Keep genetic and ancestry DNA details private unless you fully understand the privacy implications." },
  { questions: ["can i add medical history", "family medical history", "health archive"], answer: "Treat medical history as sensitive. Keep it private and share only with appropriate consent." },
  { questions: ["can i add obituary", "death notice", "memorial notice"], answer: "Add publication, date, person, family context, and a respectful description." },
  { questions: ["can i add funeral program", "funeral booklet", "memorial program"], answer: "Include person remembered, dates, location, ceremony details, and family context." },
  { questions: ["can i add cemetery photo", "tombstone photo", "grave marker"], answer: "Record name, dates, cemetery, location if appropriate, and related family history." },
  { questions: ["can i add adoption story", "adoption record", "family adoption"], answer: "Adoption stories can be sensitive. Keep private unless sharing is appropriate and consent is clear." },
  { questions: ["can i add migration document", "immigration paper", "travel record"], answer: "Redact sensitive numbers and include origin, destination, date, and family context." },
  { questions: ["can i add war story", "wartime memory", "conflict memory"], answer: "Record names, dates, places, sources, and handle traumatic or sensitive details carefully." },
  { questions: ["can i add disaster memory", "flood fire earthquake", "emergency memory"], answer: "Include date, place, people affected, what happened, and recovery context with sensitivity." },
  { questions: ["can i add pandemic memory", "covid memory", "lockdown memory"], answer: "Record dates, place, people, routines, changes, and what made the period memorable." },
  { questions: ["can i add first job", "career start", "work milestone"], answer: "Include employer, role, location, date, coworkers if known, and what you learned." },
  { questions: ["can i add retirement", "retirement memory", "last day work"], answer: "Add workplace, date, colleagues, achievements, and reflections on the career." },
  { questions: ["can i add business card", "name card", "calling card"], answer: "Add company, role, date range, owner, and why the card was saved." },
  { questions: ["can i add email screenshot", "important email", "email artifact"], answer: "Remove private addresses or sensitive text before making the artifact public." },
  { questions: ["can i add website screenshot", "webpage memory", "online artifact"], answer: "Add URL, date captured, reason it mattered, and any rights or privacy considerations." },
  { questions: ["can i add app screenshot", "game screenshot", "digital achievement"], answer: "Screenshots can capture digital life. Add app name, date, context, and why it matters." },
  { questions: ["can i add game memory", "video game memory", "gaming artifact"], answer: "Include game title, platform, date or era, people involved, and the memorable moment." },
  { questions: ["can i add hobby memory", "hobby artifact", "collection hobby"], answer: "Add the hobby, item or event, date, people, and why it became meaningful." },
  { questions: ["can i add garden memory", "plant memory", "garden photo"], answer: "Record plant, place, season, person who cared for it, and the story attached." },
  { questions: ["can i add festival food", "holiday food", "traditional food"], answer: "Include recipe, occasion, family members, place, and cultural context." },
  { questions: ["can i add language memory", "dialect", "family language"], answer: "Write original phrases, translation, speaker, context, and why the wording matters." },
  { questions: ["can i add quote", "family saying", "old phrase"], answer: "Record the exact phrase if known, who said it, when it was used, and what it meant." },
  { questions: ["can i add nickname story", "family nickname", "name origin"], answer: "Explain the nickname, who used it, origin if known, and whether it is okay to share publicly." },
  { questions: ["can i add address book", "old contacts", "phone book"], answer: "Keep contact details private. Summarize the artifact without exposing private addresses or numbers." },
  { questions: ["can i add calendar", "old calendar", "planner"], answer: "Record year, owner, important marked dates, and what the calendar reveals about daily life." },
  { questions: ["can i add shopping list", "old list", "everyday note"], answer: "Everyday notes can show routine life. Add owner, date if known, and why it was kept." },
  { questions: ["can i add classroom work", "school assignment", "homework"], answer: "Add student, school, grade or year, subject, and why the work is meaningful." },
  { questions: ["can i add report card", "school report", "grades report"], answer: "Keep sensitive grades private unless sharing is appropriate. Add school, year, and student context." },
  { questions: ["can i add class photo", "school photo", "class portrait"], answer: "Add school, year, teacher, classmates if known, and keep privacy in mind for public sharing." },
  { questions: ["can i add reunion photo", "family reunion", "school reunion"], answer: "Include date, place, group, names, and the reason for the reunion." },
  { questions: ["can i add birthday card", "greeting card", "card artifact"], answer: "Record sender, recipient, date, message summary, and why the card was saved." },
  { questions: ["can i add gift memory", "present artifact", "gift story"], answer: "Add giver, recipient, occasion, date, and the meaning behind the gift." },
  { questions: ["can i add handmade gift", "homemade gift", "crafted gift"], answer: "Include maker, materials, occasion, recipient, and the story of how it was made or given." },
  { questions: ["can i add travel itinerary", "itinerary", "trip plan"], answer: "Add destination, dates, travelers, route, and any memories connected to the plan." },
  { questions: ["can i add boarding pass", "flight memory", "plane ticket"], answer: "Redact sensitive codes if public. Add route, date, traveler, and trip story." },
  { questions: ["can i add hotel key", "hotel memory", "stay artifact"], answer: "Add hotel name, place, date, travelers, and what happened during the stay." },
  { questions: ["can i add restaurant memory", "favorite restaurant", "meal memory"], answer: "Add restaurant name, place, date, people, dish, and why the meal was memorable." },
  { questions: ["can i add market memory", "street market", "shopping memory"], answer: "Include place, date, people, items bought, sounds or smells, and the story attached." },
  { questions: ["can i add temple visit", "church visit", "mosque visit"], answer: "Record place, date, occasion, people, and respectful context." },
  { questions: ["can i add pilgrimage", "religious trip", "spiritual journey"], answer: "Add route, place, date, companions, rituals, and personal meaning with respect." },
  { questions: ["can i add performance", "stage performance", "dance show"], answer: "Include performer, event, venue, date, role, and memory of the performance." },
  { questions: ["can i add play script", "theater script", "performance document"], answer: "Record title, event, role, date, venue, and source. Respect copyright for public sharing." },
  { questions: ["can i add art exhibition", "gallery visit", "museum visit"], answer: "Add exhibition name, place, date, people, and what made the visit memorable." },
  { questions: ["can i add contest", "competition memory", "contest artifact"], answer: "Include contest name, date, place, participants, result, and story." },
  { questions: ["can i add volunteer certificate", "service certificate", "community certificate"], answer: "Add organization, role, date, recipient, and the service story." },
  { questions: ["can i add club memory", "society memory", "association"], answer: "Record club name, role, dates, members, activities, and why it mattered." },
  { questions: ["can i add scout memory", "guides memory", "uniform badge"], answer: "Add group, role, badge or event, date, place, and people involved." },
  { questions: ["can i add camp memory", "camping trip", "school camp"], answer: "Include camp name, place, date, group, activities, and strongest memory." },
  { questions: ["can i add beach memory", "sea trip", "island trip"], answer: "Add location, date, people, weather or activity, and why the moment stands out." },
  { questions: ["can i add mountain memory", "hiking memory", "climb"], answer: "Record trail or mountain, date, companions, route, difficulty, and memorable moment." },
  { questions: ["can i add road trip", "drive memory", "car trip"], answer: "Add route, stops, travelers, date, vehicle, and stories from the journey." },
  { questions: ["can i add train trip", "rail memory", "station"], answer: "Include route, station, date, travelers, ticket or photo, and trip story." },
  { questions: ["can i add bus trip", "bus memory", "coach trip"], answer: "Add route, date, travelers, destination, and what made the ride memorable." },
  { questions: ["can i add boat trip", "ferry memory", "ship memory"], answer: "Record vessel or route, date, place, travelers, and the story connected to the journey." },
  { questions: ["can i add flight memory", "airplane memory", "airport memory"], answer: "Add route, date, traveler, airline if relevant, and why the trip mattered." },
  { questions: ["can i add immigration stamp", "passport stamp", "border stamp"], answer: "Be careful with passport details. Add general travel context and keep sensitive pages private." },
  { questions: ["can i add weather memory", "rainy day", "storm memory"], answer: "Weather can be a strong detail. Add date, place, people, and how it shaped the memory." },
  { questions: ["can i add smell memory", "scent memory", "sensory memory"], answer: "Sensory details make stories vivid. Describe the smell, place, person, and moment it recalls." },
  { questions: ["can i add sound memory", "sound story", "music in memory"], answer: "Describe the sound, who or what made it, where it happened, and why it stayed with you." },
  { questions: ["can i add taste memory", "taste story", "food feeling"], answer: "Add the dish, cook, place, occasion, and what the taste reminds you of." },
  { questions: ["can i add object condition", "damaged object", "wear marks"], answer: "Describe condition, repairs, wear, and what those marks reveal about the object's life." },
  { questions: ["can i add measurements", "object size", "dimensions"], answer: "Add size, material, maker, or marks in the description if they help identify the artifact." },
  { questions: ["can i add maker", "who made it", "maker unknown"], answer: "Record the maker if known. If not, write unknown maker and include clues from labels or family stories." },
  { questions: ["can i add materials", "what made of", "material"], answer: "Materials can help future identification, especially for heirlooms, clothing, crafts, and tools." },
  { questions: ["can i add serial number", "model number", "object number"], answer: "Add non-sensitive model details if useful, but avoid public sensitive numbers or identifiers." },
  { questions: ["can i add repair history", "fixed object", "restored item"], answer: "Repair history is valuable context. Include who repaired it, when, and what changed." },
  { questions: ["can i add ownership history", "passed down", "provenance"], answer: "List owners in order if known and explain how the artifact moved through the family." },
  { questions: ["can i add value", "appraisal", "worth"], answer: "Monetary value can be private. Focus public stories on meaning, not price." },
  { questions: ["can i add insurance document", "insurance", "valuable item"], answer: "Keep insurance and appraisal documents private because they can expose sensitive financial details." },
  { questions: ["can i add location of valuables", "where stored", "valuable privacy"], answer: "Do not publicly share where valuable items are stored." },
  { questions: ["can i add living person details", "living relative", "personal info"], answer: "Minimize private details about living people unless they have consented to public sharing." },
  { questions: ["can i add deceased dates", "birth death dates", "life dates"], answer: "Life dates are common in memorial archives, but confirm accuracy before sharing publicly." },
  { questions: ["can i add maiden name", "former name", "name changes"], answer: "Add name changes when relevant, but consider privacy for living people." },
  { questions: ["can i add pronouns", "pronouns", "identity"], answer: "Use respectful current information and avoid exposing sensitive identity details without consent." },
  { questions: ["can i add ethnicity", "heritage", "ancestry"], answer: "Add heritage details respectfully and only when they help explain the memory." },
  { questions: ["can i add occupation", "job title", "profession"], answer: "Occupation helps contextualize people and objects, especially tools, uniforms, and documents." },
  { questions: ["can i add education", "school history", "university history"], answer: "Education details fit well in school, certificate, and milestone artifacts." },
  { questions: ["can i add family branch", "maternal paternal", "family side"], answer: "Use room names or descriptions to separate maternal, paternal, or other family branches." },
  { questions: ["can i add blended family", "step family", "adoptive family"], answer: "Use respectful relationship descriptions and include context only when appropriate." },
  { questions: ["can i add chosen family", "close friends family", "non biological"], answer: "Yes. Museums can preserve chosen family and close community relationships too." },
  { questions: ["can i add community contributor", "neighbor story", "mentor story"], answer: "Add their role, relationship, date or period, and why they mattered to the story." },
  { questions: ["how to avoid bias", "balanced story", "fair memory"], answer: "Distinguish facts from interpretation, cite sources, and acknowledge uncertainty or different perspectives." },
  { questions: ["how to write respectfully", "respectful tone", "sensitive writing"], answer: "Use specific facts, avoid blame-heavy wording, and consider how living people may feel reading it." },
  { questions: ["how to write for visitors", "visitor friendly", "public story"], answer: "Assume visitors need context. Explain names, relationships, places, and why the artifact matters." },
  { questions: ["how to write for family", "family audience", "private family story"], answer: "Family stories can include more detail, but still be clear about dates, people, and sources." },
  { questions: ["how to write short title", "short artifact title", "concise title"], answer: "Use five to eight meaningful words, such as Mother's Market Basket, Kuala Lumpur, 1978." },
  { questions: ["how to write room title", "short room title", "collection title"], answer: "Use a clear theme like Family Recipes, Penang Years, Father's Tools, or School Days." },
  { questions: ["how to write alt text", "image alt", "describe image"], answer: "Describe the visible image plainly: who or what appears, location, and notable action or object." },
  { questions: ["why alt text matters", "accessibility image", "accessible archive"], answer: "Clear descriptions help people using screen readers and make images easier to understand when they fail to load." },
  { questions: ["can i add captions", "photo caption", "image caption"], answer: "Use the artifact title or description as a caption if there is no separate caption field." },
  { questions: ["can i add labels", "museum label", "wall label"], answer: "A good museum label has title, date, creator or owner, and a short interpretive note." },
  { questions: ["museum label example", "artifact label example", "label format"], answer: "Example: Wedding Invitation, Ipoh, 1986. Saved by the family as a record of the ceremony and guest list." },
  { questions: ["room intro example", "collection intro example", "exhibition intro"], answer: "Example: This room gathers memories from our Penang years, including school days, family meals, and neighborhood stories." },
  { questions: ["memory story example", "artifact description example", "description sample"], answer: "Example: This watch belonged to my grandfather and was worn every day during his years at the railway station." },
  { questions: ["can i use bullets", "bullet points", "list in story"], answer: "Bullets can work for facts, but a short paragraph often feels warmer for personal memories." },
  { questions: ["can i use markdown", "format text", "rich text"], answer: "Text formatting depends on the form. If plain text only, keep formatting simple and readable." },
  { questions: ["can i add links in description", "link in story", "external link"], answer: "Links depend on the text field. Add source URLs only if they are safe and useful." },
  { questions: ["external links privacy", "public links", "link safety"], answer: "Be careful linking to private albums, documents, or pages that expose personal information." },
  { questions: ["can i add youtube", "youtube video", "video link"], answer: "If links are allowed, add a YouTube link in the description. Check privacy settings on the video." },
  { questions: ["can i add google photos", "google photos link", "photo album link"], answer: "Google Photos links may expose album access. Use privacy settings carefully and prefer direct app uploads if supported." },
  { questions: ["can i add drive link", "google drive link", "file link"], answer: "Drive links can reveal private files. Confirm sharing permissions before using them in public artifacts." },
  { questions: ["can i add dropbox link", "dropbox file", "cloud file link"], answer: "Use cloud links only when permissions are correct and the file is safe to share." },
  { questions: ["can i add location link", "maps link", "google maps link"], answer: "Use general locations for public memories and avoid linking exact private addresses." },
  { questions: ["can i add contact info", "contact in artifact", "email in story"], answer: "Avoid public contact information unless it is intentionally shared business or public information." },
  { questions: ["can i add qr code", "qr code artifact", "scan code"], answer: "You can archive a QR code image, but check what it links to before making it public." },
  { questions: ["can i add barcode", "barcode artifact", "product code"], answer: "Barcodes can be archived as object details if they help identify an item." },
  { questions: ["can i add location without map", "plain location", "map optional"], answer: "Yes. Even if mapping does not resolve it, a written location still helps the story." },
  { questions: ["can i add fictional story", "fiction", "creative writing"], answer: "Memoirium is best for real memories. If you add creative writing, label it clearly." },
  { questions: ["can i add dream", "dream memory", "dream journal"], answer: "You can archive personal dream notes if meaningful, but label them as dreams rather than factual events." },
  { questions: ["can i add future plan", "future memory", "bucket list"], answer: "Use private notes or a dedicated room if you want to preserve plans, but separate them from completed memories." },
  { questions: ["can i add goals", "life goals", "personal goals"], answer: "Goals can be archived as personal reflections, especially if connected to a date, place, or object." },
  { questions: ["can i add reflection", "personal reflection", "journal reflection"], answer: "Yes. Reflections help explain why a memory matters beyond the facts." },
  { questions: ["can i add lesson learned", "life lesson", "what i learned"], answer: "A lesson learned is a strong ending for a memory description." },
  { questions: ["can i add quote from relative", "relative quote", "direct quote"], answer: "Use quotes carefully and mention who said them and when if known." },
  { questions: ["can i add private joke", "inside joke", "family joke"], answer: "Private jokes can be meaningful, but add enough context so future readers understand them." },
  { questions: ["can i add nickname without context", "unknown nickname", "nickname only"], answer: "Add context where possible, including who used the nickname and why." },
  { questions: ["can i add multiple dates", "date range", "from to date"], answer: "If the form supports one date only, use the main date and describe the range in the story." },
  { questions: ["can i add date range", "years lived", "period memory"], answer: "Use a representative date if required and explain the full range in the description." },
  { questions: ["can i add age", "age at memory", "how old"], answer: "Add the person's age in the description if it helps explain the memory." },
  { questions: ["can i add time of day", "morning evening", "exact time"], answer: "Include time of day in the description if it is memorable or relevant." },
  { questions: ["can i add season", "monsoon", "summer winter"], answer: "Seasons are useful context when exact dates are unknown." },
  { questions: ["can i add holiday date", "festival date", "lunar date"], answer: "Add the known date and mention the festival or calendar system in the description." },
  { questions: ["can i add lunar date", "chinese calendar", "islamic date"], answer: "Use the regular date field if possible and write the lunar or religious calendar date in the story." },
  { questions: ["can i add timezone detail", "time zone", "travel date"], answer: "For travel memories, write local place and date context in the description if time zones could confuse the record." },
  { questions: ["can i add weather detail", "hot day", "rain detail"], answer: "Yes. Weather details often make memory stories more vivid." },
  { questions: ["can i add emotion later", "change emotion", "update feeling"], answer: "Edit the artifact and update the emotion if the field is available." },
  { questions: ["which emotion should i pick", "choose emotion", "emotion advice"], answer: "Choose the feeling that best captures the memory's meaning, not just the event type." },
  { questions: ["can i use multiple emotions", "many emotions", "mixed feelings"], answer: "If only one emotion is supported, pick the strongest one and describe the mix in the story." },
  { questions: ["sad and happy", "bittersweet", "mixed memory"], answer: "Use the description to explain the mixed feeling. Bittersweet memories are common and worth preserving." },
  { questions: ["can i remove emotion", "clear emotion", "no feeling tag"], answer: "Edit the artifact and clear the emotion field if the form allows it." },
  { questions: ["can i add mood", "mood tag", "feeling tag"], answer: "Use the emotion field or write the mood in the artifact description." },
  { questions: ["can i add category instead emotion", "category tag", "type of memory"], answer: "Use rooms for categories and emotion tags for feelings when both are available." },
  { questions: ["can i use rooms as categories", "rooms categories", "collection categories"], answer: "Yes. Rooms are a practical way to group memories by category or theme." },
  { questions: ["how many questions can chatbot answer", "over 500", "question coverage"], answer: "This local assistant includes more than 500 built-in question entries focused on common Memoirium dashboard needs." },
  { questions: ["did you use external api", "external api used", "api used"], answer: "No. This assistant uses local built-in responses and does not call an external API." },
  { questions: ["is chatbot rule based", "rule based bot", "faq bot"], answer: "Yes. It matches common phrases to local answers inside the dashboard component." },
  { questions: ["does chatbot learn", "learn from users", "training"], answer: "No. It does not learn from messages or train on user conversations." },
  { questions: ["does chatbot store messages", "store chat messages", "save conversations"], answer: "No persistent chat storage is added. Messages live only in the dashboard page state." },
  { questions: ["does chatbot send network request", "network request chat", "chat fetch"], answer: "No chat network request is added. It replies from local in-page data." },
  { questions: ["can chatbot hallucinate", "made up answer", "incorrect bot"], answer: "It can still give generic guidance that may not match every app configuration. Check the actual page controls for final behavior." },
  { questions: ["why chatbot fallback", "fallback answer", "unknown response"], answer: "Fallback replies appear when your wording does not match one of the local question phrases." },
  { questions: ["how to get better chatbot answer", "better answer", "rephrase question"], answer: "Ask with keywords like artifact, room, achievement, privacy, location, public, image, account, or dashboard." },
  { questions: ["can chatbot answer in malay", "bahasa malaysia", "malay answer"], answer: "The current built-in answers are written in English. Malay responses would require adding Malay answer entries." },
  { questions: ["can chatbot answer chinese", "mandarin answer", "chinese language"], answer: "The current built-in answers are English. Chinese responses would require adding localized entries." },
  { questions: ["can chatbot answer tamil", "tamil answer", "tamil language"], answer: "The current built-in answers are English. Tamil responses would require adding localized entries." },
  { questions: ["can chatbot answer arabic", "arabic answer", "arabic language"], answer: "The current built-in answers are English. Arabic responses would require adding localized entries." },
  { questions: ["can chatbot answer short", "short answers", "brief response"], answer: "Most answers are intentionally short so the chat stays easy to scan." },
  { questions: ["can chatbot give steps", "step by step", "instructions"], answer: "Ask for the task directly, such as how to add an artifact or make a memory public." },
  { questions: ["can chatbot recommend room", "room recommendation", "suggest collection"], answer: "Yes. Ask for room ideas based on family, travel, school, recipes, milestones, heirlooms, or places." },
  { questions: ["can chatbot recommend title", "title recommendation", "suggest title"], answer: "Yes. Give the memory type and key details, then use a specific title with person, place, event, or date." },
  { questions: ["can chatbot write story", "write for me", "generate description"], answer: "It can give writing guidance, but it does not generate long custom stories from your private data." },
  { questions: ["can chatbot see dashboard counts", "knows my stats", "read my count"], answer: "No. The helper does not inspect current dashboard stats. It gives general guidance." },
  { questions: ["can chatbot use my profile", "read profile", "profile aware"], answer: "No. It does not read profile fields for personalized replies." },
  { questions: ["can chatbot use memory list", "read memories", "memory aware"], answer: "No. It does not read your memory content or list." },
  { questions: ["can chatbot open page", "navigate for me", "click for me"], answer: "No. It explains where to go, but it does not navigate or click on your behalf." },
  { questions: ["can chatbot submit form", "fill form", "save for me"], answer: "No. You need to complete and submit forms yourself." },
  { questions: ["can chatbot validate privacy", "check private", "review sharing"], answer: "It can give a checklist, but it cannot inspect your artifacts for privacy issues." },
  { questions: ["can chatbot moderate", "auto moderate", "review content"], answer: "No. Moderation tools, if available, are separate admin features." },
  { questions: ["can chatbot translate", "translate memory", "language conversion"], answer: "The local assistant does not perform real translation. Add translations manually or use a trusted translation tool." },
  { questions: ["can chatbot summarize", "summarize artifact", "summary"], answer: "It cannot read artifacts to summarize them. You can ask for general summary-writing tips." },
  { questions: ["can chatbot search docs", "read docs", "documentation"], answer: "No. It only uses built-in dashboard guidance." },
  { questions: ["can chatbot access internet", "web access", "browse web"], answer: "No. The assistant does not browse the web." },
  { questions: ["can chatbot answer latest", "latest update", "current news"], answer: "No. It is local and does not know current external news or updates." },
  { questions: ["can chatbot answer technical", "developer question", "code question"], answer: "It can give basic project guidance, but it is mainly for dashboard user help." },
  { questions: ["can chatbot answer supabase", "supabase help", "backend help"], answer: "It can give general hints, but detailed backend debugging needs developer review." },
  { questions: ["can chatbot answer deployment", "deploy help", "hosting help"], answer: "It can give general deployment reminders, but exact hosting setup depends on your environment." },
  { questions: ["can chatbot answer design", "ui help", "design help"], answer: "It can explain current UI behavior and suggest content organization, not redesign the app from chat." },
  { questions: ["can chatbot answer museum tips", "curation assistant", "archive tips"], answer: "Yes. It is strongest at museum organization, artifact writing, privacy, and dashboard guidance." },
  { questions: ["can chatbot answer troubleshooting", "fix issue", "debug dashboard"], answer: "It can suggest simple checks like refresh, sign in, connection, required fields, and visibility settings." },
  { questions: ["can chatbot answer legal", "legal advice", "law"], answer: "No. It can suggest privacy caution but cannot provide legal advice." },
  { questions: ["can chatbot answer medical", "medical advice", "health"], answer: "No. It can suggest keeping health records private but cannot provide medical advice." },
  { questions: ["can chatbot answer financial", "financial advice", "money advice"], answer: "No. It can discuss privacy around financial records but cannot provide financial advice." },
  { questions: ["can chatbot answer genealogy", "family tree help", "ancestry help"], answer: "It can give basic family archive and source-note tips, but not external genealogy research." },
  { questions: ["can chatbot answer research", "research help", "historical research"], answer: "It can suggest recording sources and uncertainty, but it does not search external archives." },
  { questions: ["can chatbot answer copyright", "copyright help", "rights help"], answer: "It can give general caution about permissions, but not legal copyright advice." },
  { questions: ["can chatbot answer accessibility", "accessibility help", "screen reader help"], answer: "It can suggest clear titles, descriptions, and alt-text-style wording for accessible archives." },
  { questions: ["can chatbot answer keyboard shortcuts", "shortcut help", "hotkeys"], answer: "It can suggest standard browser keyboard behavior, but custom shortcuts depend on app implementation." },
  { questions: ["can chatbot answer image quality", "photo quality", "scan advice"], answer: "Yes. It can give common scanning, cropping, lighting, and file format advice." },
  { questions: ["can chatbot answer writing prompts", "prompt help", "memory prompt"], answer: "Yes. It can suggest prompts for family interviews, objects, places, recipes, and life events." },
  { questions: ["can chatbot answer onboarding", "new user help", "getting started help"], answer: "Yes. It can guide new users through rooms, artifacts, dates, locations, and privacy basics." },
  { questions: ["can chatbot answer dashboard only", "dashboard scope", "only dashboard"], answer: "Yes. The widget is intentionally available on the dashboard page only." },
  { questions: ["can chatbot work after refresh", "refresh chat", "reload chat"], answer: "After refresh, the assistant resets to its opening message because chat history is not persisted." },
];

const localAssistantQuestions = [...assistantQuestions, ...additionalAssistantQuestions, ...expandedAssistantQuestions];

function getAssistantReply(question: string) {
  const normalizedQuestion = question.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const entry = localAssistantQuestions.find((item) =>
    item.questions.some((candidate) => normalizedQuestion.includes(candidate)),
  );

  return (
    entry?.answer ??
    "I can help with Memoirium dashboard basics. Try asking about artifacts, exhibition rooms, achievements, public memories, locations, privacy, or writing a memory."
  );
}

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hi, I am your Memoirium helper. Ask me about artifacts, rooms, achievements, locations, privacy, or getting started.",
    },
  ]);
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
    { icon: Images, label: "Total Artifacts", value: memories.length.toString(), trend: "In your archive" },
    { icon: FolderOpen, label: "Exhibition Rooms", value: collections.length.toString(), trend: "Curated spaces" },
    { icon: Globe, label: "Public Artifacts", value: publicMemoryCount.toString(), trend: "Visible to visitors" },
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
  const sendChatMessage = () => {
    const message = chatInput.trim();

    if (!message) return;

    setChatMessages((currentMessages) => [
      ...currentMessages,
      { id: Date.now(), role: "user", text: message },
      { id: Date.now() + 1, role: "assistant", text: getAssistantReply(message) },
    ]);
    setChatInput("");
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
                    <h2 className="text-2xl text-[var(--gold-primary)]">Recent Artifacts</h2>
                    <Button variant="outline" size="sm" onClick={() => navigate("/collections")}>
                      <Plus size={18} />
                      Add Artifact
                    </Button>
                  </div>

                  {recentMemories.length === 0 ? (
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                      <Images size={32} className="mx-auto mb-4 text-[var(--gold-primary)]" />
                      <h3 className="text-2xl mb-2 text-[var(--gold-primary)]">No artifacts archived yet</h3>
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

      {chatOpen && (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-24 right-4 z-50 flex h-[min(560px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-lg border border-[var(--gold-primary)]/30 bg-[var(--surface)] shadow-2xl shadow-black/50 sm:right-6"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-light)] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold-primary)] text-black">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-sm text-[var(--text-primary)]">Memoirium Assistant</h2>
                <p className="text-xs text-[var(--text-secondary)]">Local dashboard help</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--gold-primary)] hover:text-[var(--gold-primary)]"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-[var(--gold-primary)] text-black"
                      : "border border-[var(--border)] bg-black/20 text-[var(--text-primary)]"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--border)] bg-[var(--surface-light)] p-3">
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                sendChatMessage();
              }}
            >
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask about your museum..."
                className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-secondary)] focus:border-[var(--gold-primary)]"
              />
              <button
                type="submit"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--gold-primary)] text-black transition-transform hover:scale-105"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </motion.div>
      )}

      <button
        type="button"
        onClick={() => setChatOpen((isOpen) => !isOpen)}
        className="fixed bottom-6 right-4 z-50 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--gold-primary)]/50 bg-[var(--gold-primary)] text-black shadow-2xl shadow-black/50 transition-transform hover:scale-105 sm:right-6"
        aria-label={chatOpen ? "Hide chat assistant" : "Open chat assistant"}
      >
        {chatOpen ? <X size={26} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}
