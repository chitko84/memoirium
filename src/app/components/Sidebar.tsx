import { useEffect, useState } from "react";
import { LayoutDashboard, FolderOpen, Clock, Settings, X, LogOut, Cuboid, MapPin, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { getCurrentProfile } from "../services/profiles";
import type { Profile } from "../types/memoirium";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderOpen, label: "Exhibition Rooms", path: "/collections" },
  { icon: Clock, label: "Timeline", path: "/timeline" },
  { icon: Cuboid, label: "Museum Gallery", path: "/gallery" },
  { icon: Cuboid, label: "3D Museum", path: "/museum-3d" },
  { icon: MapPin, label: "Memory Map", path: "/map" },
  { icon: Settings, label: "Settings", path: "/settings" }
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const displayName = profile?.display_name || user?.user_metadata.display_name || user?.email || "Memoirium Curator";
  const initials = displayName
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    onClose?.();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user) {
        setIsAdmin(false);
        setProfile(null);
        return;
      }

      try {
        const nextProfile = await getCurrentProfile(user.id);
        if (isMounted) {
          setProfile(nextProfile);
          setIsAdmin(nextProfile?.role === "admin");
        }
      } catch {
        if (isMounted) {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    };

    const handleProfileUpdated = (event: Event) => {
      const nextProfile = (event as CustomEvent<Profile>).detail;
      if (nextProfile?.id === user?.id) {
        setProfile(nextProfile);
        setIsAdmin(nextProfile.role === "admin");
      }
    };

    window.addEventListener("memoirium-profile-updated", handleProfileUpdated);
    void loadProfile();

    return () => {
      isMounted = false;
      window.removeEventListener("memoirium-profile-updated", handleProfileUpdated);
    };
  }, [user]);

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-[var(--surface)] border-r border-[var(--border)] z-50
        transition-transform duration-300 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/memoirium-logo.png"
              alt="Memoirium logo"
              className="h-10 w-10 rounded-full border border-[var(--gold-primary)]/35 object-cover"
            />
            <h2 className="text-xl tracking-wider text-[var(--gold-primary)]">MEMOIRIUM</h2>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-[var(--text-primary)]">
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  onClose?.();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
                  ${isActive
                    ? 'bg-[var(--gold-primary)] text-[#0F1115]'
                    : 'text-[var(--text-primary)] hover:bg-[var(--surface-light)] hover:text-[var(--gold-primary)]'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
          {isAdmin && (
            <button
              onClick={() => {
                navigate("/admin");
                onClose?.();
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
                ${location.pathname.startsWith("/admin")
                  ? 'bg-[var(--gold-primary)] text-[#0F1115]'
                  : 'text-[var(--text-primary)] hover:bg-[var(--surface-light)] hover:text-[var(--gold-primary)]'
                }
              `}
            >
              <ShieldCheck size={20} />
              <span className="font-medium">Admin Wing</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 overflow-hidden rounded-full bg-[var(--gold-primary)] flex items-center justify-center text-[#0F1115] font-semibold">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                initials || "MC"
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">{displayName}</p>
              <p className="text-xs text-[var(--text-secondary)]">Curator</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--surface-light)] hover:text-[var(--gold-primary)] transition-all duration-300"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
