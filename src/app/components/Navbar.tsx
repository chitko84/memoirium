import { LogOut, Menu, Search, User } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

interface NavbarProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
}

export function Navbar({ onMenuClick, showSearch = false }: NavbarProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button onClick={onMenuClick} className="lg:hidden text-[var(--text-primary)]">
              <Menu size={24} />
            </button>
          )}
          <h1 className="text-2xl tracking-wider text-[var(--gold-primary)]">MEMOIRIUM</h1>
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
          <button className="w-10 h-10 rounded-full bg-[var(--gold-primary)] flex items-center justify-center">
            <User size={20} className="text-[#0F1115]" />
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
