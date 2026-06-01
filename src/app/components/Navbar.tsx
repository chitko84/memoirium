import { useEffect, useState } from "react";
import { LogOut, Menu, Search, User } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { getCurrentProfile } from "../services/profiles";
import type { Profile } from "../types/memoirium";

interface NavbarProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
}

export function Navbar({ onMenuClick, showSearch = false }: NavbarProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      try {
        const nextProfile = await getCurrentProfile(user.id);
        if (isMounted) setProfile(nextProfile);
      } catch {
        if (isMounted) setProfile(null);
      }
    };

    const handleProfileUpdated = (event: Event) => {
      const nextProfile = (event as CustomEvent<Profile>).detail;
      if (nextProfile?.id === user?.id) setProfile(nextProfile);
    };

    window.addEventListener("memoirium-profile-updated", handleProfileUpdated);
    void loadProfile();

    return () => {
      isMounted = false;
      window.removeEventListener("memoirium-profile-updated", handleProfileUpdated);
    };
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button onClick={onMenuClick} className="lg:hidden text-[var(--text-primary)]">
              <Menu size={24} />
            </button>
          )}
          <div className="flex items-center gap-3">
            <img
              src="/memoirium-logo.png"
              alt="Memoirium logo"
              className="h-9 w-9 rounded-full border border-[var(--gold-primary)]/35 object-cover"
            />
            <h1 className="text-2xl tracking-wider text-[var(--gold-primary)]">MEMOIRIUM</h1>
          </div>
        </div>

        {showSearch && (
          <div className="hidden md:flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 flex-1 max-w-md mx-8">
            <Search size={18} className="text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search memories..."
              className="bg-transparent border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] flex-1"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <button className="w-10 h-10 overflow-hidden rounded-full bg-[var(--gold-primary)] flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover" />
            ) : (
              <User size={20} className="text-[#0F1115]" />
            )}
          </button>
          <button
            onClick={handleSignOut}
            className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--gold-primary)] hover:text-[var(--gold-primary)] transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
