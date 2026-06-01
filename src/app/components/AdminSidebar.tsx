import { BarChart3, Building2, LayoutDashboard, ShieldCheck, Users, ArrowLeft } from "lucide-react";
import { NavLink } from "react-router";

const adminItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/admin" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: Building2, label: "Museums", path: "/admin/museums" },
  { icon: ShieldCheck, label: "Moderation", path: "/admin/moderation" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
];

export function AdminSidebar() {
  return (
    <aside className="border-b border-[var(--border)] bg-[var(--surface)] lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="border-b border-[var(--border)] p-6">
        <div className="flex items-center gap-3">
          <img
            src="/memoirium-logo.png"
            alt="Memoirium logo"
            className="h-11 w-11 rounded-full border border-[var(--gold-primary)]/40 object-cover"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--gold-secondary)]">Admin Wing</p>
            <h1 className="text-xl tracking-wider text-[var(--gold-primary)]">MEMOIRIUM</h1>
          </div>
        </div>
      </div>

      <nav className="grid gap-2 p-4 sm:grid-cols-3 lg:block lg:space-y-2">
        {adminItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all ${
                  isActive
                    ? "bg-[var(--gold-primary)] text-[#0F1115]"
                    : "text-[var(--text-primary)] hover:bg-[var(--surface-light)] hover:text-[var(--gold-primary)]"
                }`
              }
            >
              <Icon size={18} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] transition-all hover:bg-[var(--surface-light)] hover:text-[var(--gold-primary)]"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back to Museum</span>
        </NavLink>
      </nav>
    </aside>
  );
}
