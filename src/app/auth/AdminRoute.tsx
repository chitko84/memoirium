import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "./AuthContext";
import { getCurrentProfile } from "../services/profiles";
import type { Profile } from "../types/memoirium";

function AdminLoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--gold-primary)]">
      <div className="text-center">
        <h1 className="text-4xl tracking-wider mb-3">MEMOIRIUM</h1>
        <p className="text-sm text-[var(--text-secondary)]">Verifying admin access...</p>
      </div>
    </div>
  );
}

function AccessRestricted() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-20 text-[var(--text-primary)]">
      <div className="mx-auto max-w-2xl rounded-lg border border-[var(--gold-primary)]/30 bg-[var(--surface)] p-10 text-center shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--gold-primary)]/40 bg-[var(--gold-primary)]/10">
          <ShieldAlert size={30} className="text-[var(--gold-primary)]" />
        </div>
        <p className="mb-3 text-xs uppercase tracking-[0.32em] text-[var(--gold-secondary)]">Admin Wing</p>
        <h1 className="mb-4 text-4xl text-[var(--gold-primary)]">Access Restricted</h1>
        <p className="mx-auto max-w-lg text-[var(--text-secondary)] leading-relaxed">
          This area is reserved for Memoirium platform administrators. Your curator account remains available in the
          museum dashboard.
        </p>
      </div>
    </div>
  );
}

export function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      setError("");

      try {
        const nextProfile = await getCurrentProfile(user.id);
        if (isMounted) setProfile(nextProfile);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Unable to verify admin access.");
        }
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading || profileLoading) {
    return <AdminLoadingState />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (error || profile?.role !== "admin") {
    return <AccessRestricted />;
  }

  return <Outlet />;
}
