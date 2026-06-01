import { LayoutDashboard, FolderOpen, Clock, Settings, X, LogOut, Cuboid, MapPin } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../auth/AuthContext";

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
  const displayName = user?.user_metadata.display_name || user?.email || "Memoirium Curator";
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
          <h2 className="text-xl tracking-wider text-[var(--gold-primary)]">MEMOIRIUM</h2>
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
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-[var(--gold-primary)] flex items-center justify-center text-[#0F1115] font-semibold">
              {initials || "MC"}
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
