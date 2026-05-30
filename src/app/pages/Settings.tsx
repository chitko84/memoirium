import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Copy, ExternalLink, Eye, EyeOff, Save, Settings as SettingsIcon, User } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/Button";
import { useAuth } from "../auth/AuthContext";
import { getCurrentProfile, updateProfile } from "../services/profiles";
import type { Profile } from "../types/memoirium";

type SettingsForm = {
  display_name: string;
  username: string;
  bio: string;
  avatar_url: string;
  museum_title: string;
  museum_tagline: string;
  is_public: boolean;
};

const emptyForm: SettingsForm = {
  display_name: "",
  username: "",
  bio: "",
  avatar_url: "",
  museum_title: "",
  museum_tagline: "",
  is_public: false,
};

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function getFriendlyProfileError(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("duplicate") || lower.includes("unique")) {
    return "That username is already part of another museum. Choose a different one.";
  }

  if (lower.includes("check") || lower.includes("username")) {
    return "Usernames can use lowercase letters, numbers, underscores, and hyphens only.";
  }

  return "Unable to save your museum profile. Please review the fields and try again.";
}

export function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();

  const publicMuseumPath = `/museum/${form.username || "username"}`;
  const publicMuseumUrl = useMemo(() => {
    if (typeof window === "undefined") return publicMuseumPath;
    return `${window.location.origin}${publicMuseumPath}`;
  }, [publicMuseumPath]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setIsLoading(true);
      setError("");

      try {
        const data = await getCurrentProfile(user.id);
        setProfile(data);
        setForm(
          data
            ? {
                display_name: data.display_name,
                username: data.username,
                bio: data.bio ?? "",
                avatar_url: data.avatar_url ?? "",
                museum_title: data.museum_title ?? "",
                museum_tagline: data.museum_tagline ?? "",
                is_public: data.is_public,
              }
            : {
                ...emptyForm,
                display_name: user.user_metadata.display_name ?? "",
                username: normalizeUsername(user.user_metadata.username ?? user.email?.split("@")[0] ?? ""),
                museum_title: user.user_metadata.display_name
                  ? `${user.user_metadata.display_name}'s Museum`
                  : "",
              },
        );
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load your museum profile.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, [user]);

  const validate = () => {
    const username = normalizeUsername(form.username);

    if (!form.display_name.trim()) {
      return "Display name is required.";
    }

    if (!username) {
      return "Username is required.";
    }

    if (!/^[a-z0-9_-]+$/.test(username)) {
      return "Username can only use lowercase letters, numbers, underscores, and hyphens.";
    }

    if (username.length < 3) {
      return "Username must be at least 3 characters.";
    }

    return "";
  };

  const handleSave = async () => {
    if (!user) return;

    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);

    try {
      const savedProfile = await updateProfile(user.id, {
        display_name: form.display_name.trim(),
        username: normalizeUsername(form.username),
        bio: form.bio.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
        museum_title: form.museum_title.trim() || null,
        museum_tagline: form.museum_tagline.trim() || null,
        is_public: form.is_public,
      });

      setProfile(savedProfile);
      setForm({
        display_name: savedProfile.display_name,
        username: savedProfile.username,
        bio: savedProfile.bio ?? "",
        avatar_url: savedProfile.avatar_url ?? "",
        museum_title: savedProfile.museum_title ?? "",
        museum_tagline: savedProfile.museum_tagline ?? "",
        is_public: savedProfile.is_public,
      });
      setSuccess("Museum profile saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? getFriendlyProfileError(saveError.message) : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const copyMuseumLink = async () => {
    await navigator.clipboard.writeText(publicMuseumUrl);
    setSuccess("Public museum link copied.");
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} showSearch />

        <main className="flex-1 p-6 lg:p-8 mt-16">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 border border-[var(--gold-primary)]/25 bg-[var(--surface)] px-4 py-2 text-sm text-[var(--gold-secondary)]">
                <SettingsIcon size={16} />
                Museum Identity
              </div>
              <h1 className="text-4xl mb-2 text-[var(--gold-primary)]">Settings</h1>
              <p className="text-[var(--text-secondary)]">
                Curate the public identity, title, and access for your museum.
              </p>
            </motion.div>

            {isLoading && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
                <p className="text-[var(--gold-primary)]">Loading museum profile...</p>
              </div>
            )}

            {!isLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
                <div
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6"
                  style={{ boxShadow: "0 14px 44px rgba(0, 0, 0, 0.35)" }}
                >
                  {!profile && (
                    <div className="mb-6 rounded-lg border border-[var(--gold-primary)]/30 bg-[var(--gold-primary)]/10 px-4 py-3 text-sm text-[var(--gold-secondary)]">
                      No profile was found yet. Saving this form will create your museum profile.
                    </div>
                  )}

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2 text-[var(--text-primary)]">Display Name</label>
                        <input
                          value={form.display_name}
                          onChange={(event) => setForm((current) => ({ ...current, display_name: event.target.value }))}
                          className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2 text-[var(--text-primary)]">Username</label>
                        <input
                          value={form.username}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, username: normalizeUsername(event.target.value) }))
                          }
                          className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-[var(--text-primary)]">Bio</label>
                      <textarea
                        value={form.bio}
                        onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                        className="min-h-28 w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-[var(--text-primary)]">Avatar URL</label>
                      <input
                        value={form.avatar_url}
                        onChange={(event) => setForm((current) => ({ ...current, avatar_url: event.target.value }))}
                        className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2 text-[var(--text-primary)]">Museum Title</label>
                        <input
                          value={form.museum_title}
                          onChange={(event) => setForm((current) => ({ ...current, museum_title: event.target.value }))}
                          className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
                          placeholder="The Museum of ..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2 text-[var(--text-primary)]">Museum Tagline</label>
                        <input
                          value={form.museum_tagline}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, museum_tagline: event.target.value }))
                          }
                          className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
                          placeholder="Every memory deserves a gallery."
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-[var(--text-primary)]">
                      <input
                        type="checkbox"
                        checked={form.is_public}
                        onChange={(event) => setForm((current) => ({ ...current, is_public: event.target.checked }))}
                        className="h-4 w-4 accent-[var(--gold-primary)]"
                      />
                      Make my public museum visible
                    </label>

                    {error && (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="rounded-lg border border-[var(--gold-primary)]/30 bg-[var(--gold-primary)]/10 px-4 py-3 text-sm text-[var(--gold-secondary)]">
                        {success}
                      </div>
                    )}

                    <Button variant="primary" onClick={() => void handleSave()} disabled={isSaving}>
                      <Save size={18} />
                      {isSaving ? "Saving..." : "Save Museum Profile"}
                    </Button>
                  </div>
                </div>

                <aside
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 h-fit"
                  style={{ boxShadow: "0 14px 44px rgba(0, 0, 0, 0.35)" }}
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-[var(--gold-primary)]/10 border border-[var(--gold-primary)]/30 flex items-center justify-center overflow-hidden">
                      {form.avatar_url ? (
                        <img src={form.avatar_url} alt={form.display_name} className="h-full w-full object-cover" />
                      ) : (
                        <User size={26} className="text-[var(--gold-primary)]" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Public Preview</p>
                      <h2 className="text-xl text-[var(--gold-primary)]">{form.display_name || "Curator"}</h2>
                    </div>
                  </div>

                  <div className="mb-6 rounded-lg border border-[var(--gold-primary)]/25 bg-black/25 p-4">
                    <p className="mb-2 text-xs uppercase tracking-wider text-[var(--text-secondary)]">Museum Link</p>
                    <p className="break-all text-sm text-[var(--gold-secondary)]">{publicMuseumPath}</p>
                  </div>

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full" onClick={() => void copyMuseumLink()}>
                      <Copy size={18} />
                      Copy Link
                    </Button>
                    <Button
                      variant="primary"
                      className="w-full"
                      disabled={!form.is_public || !form.username}
                      onClick={() => window.open(publicMuseumPath, "_blank", "noopener,noreferrer")}
                    >
                      {form.is_public ? <Eye size={18} /> : <EyeOff size={18} />}
                      View Public Museum
                      <ExternalLink size={16} />
                    </Button>
                  </div>

                  {!form.is_public && (
                    <p className="mt-4 text-sm text-[var(--text-secondary)]">
                      Turn on public visibility before visitors can enter this museum.
                    </p>
                  )}
                </aside>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
