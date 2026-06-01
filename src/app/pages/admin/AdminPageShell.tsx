import type { ReactNode } from "react";
import { AdminSidebar } from "../../components/AdminSidebar";

export function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function AdminPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] lg:flex">
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[var(--gold-secondary)]">Platform Management</p>
            <h1 className="mb-3 text-4xl text-[var(--gold-primary)] sm:text-5xl">{title}</h1>
            <p className="max-w-3xl text-[var(--text-secondary)] leading-relaxed">{description}</p>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}

export function AdminStatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-3 text-4xl text-[var(--gold-primary)]">{value}</p>
    </div>
  );
}

export function AdminState({
  title,
  description,
  tone = "default",
}: {
  title: string;
  description: string;
  tone?: "default" | "danger";
}) {
  return (
    <div
      className={`rounded-lg border p-8 text-center ${
        tone === "danger" ? "border-red-500/30 bg-red-500/10" : "border-[var(--border)] bg-[var(--surface)]"
      }`}
    >
      <h2 className={`mb-2 text-2xl ${tone === "danger" ? "text-red-200" : "text-[var(--gold-primary)]"}`}>{title}</h2>
      <p className="text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full min-w-[760px] text-left text-sm">{children}</table>
    </div>
  );
}

export function AdminTh({ children }: { children: ReactNode }) {
  return <th className="border-b border-[var(--border)] px-4 py-3 text-[var(--gold-secondary)]">{children}</th>;
}

export function AdminTd({ children }: { children: ReactNode }) {
  return <td className="border-b border-[var(--border)] px-4 py-3 text-[var(--text-secondary)]">{children}</td>;
}
