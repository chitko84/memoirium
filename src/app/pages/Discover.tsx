import { Landmark, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/Button";

export function Discover() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-20">
      <main className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-5xl items-center justify-center">
        <section
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center md:p-14"
          style={{ boxShadow: "0 18px 60px rgba(0, 0, 0, 0.45)" }}
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold-primary)]/10">
            <Landmark size={34} className="text-[var(--gold-primary)]" />
          </div>
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-[var(--text-secondary)]">Discover</p>
          <h1 className="mb-5 text-5xl text-[var(--gold-primary)]">Public Museums</h1>
          <p className="mx-auto mb-4 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
            Discover curated memory museums shared by the community.
          </p>
          <p className="mb-8 text-sm uppercase tracking-[0.25em] text-[var(--gold-secondary)]">
            Public discovery is coming soon.
          </p>
          <Button variant="primary" onClick={() => navigate(user ? "/dashboard" : "/register")}>
            <Plus size={18} />
            Create Your Museum
          </Button>
        </section>
      </main>
    </div>
  );
}
