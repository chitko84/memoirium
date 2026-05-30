import { Landmark } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/Button";

export function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-6">
      <div
        className="max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center"
        style={{ boxShadow: "0 18px 60px rgba(0, 0, 0, 0.45)" }}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold-primary)]/10">
          <Landmark size={34} className="text-[var(--gold-primary)]" />
        </div>
        <p className="mb-3 text-sm uppercase tracking-[0.35em] text-[var(--text-secondary)]">Lost Wing</p>
        <h1 className="text-5xl mb-5 text-[var(--gold-primary)]">Gallery Not Found</h1>
        <p className="mb-8 text-[var(--text-secondary)]">
          This corridor is closed or no longer exists in the museum.
        </p>
        <Button variant="primary" onClick={() => navigate(user ? "/dashboard" : "/")}>
          Return to {user ? "Dashboard" : "Home"}
        </Button>
      </div>
    </div>
  );
}
