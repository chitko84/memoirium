import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./AuthContext";

function RouteLoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--gold-primary)]">
      <div className="text-center">
        <h1 className="text-4xl tracking-wider mb-3">MEMOIRIUM</h1>
        <p className="text-sm text-[var(--text-secondary)]">Opening your museum...</p>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteLoadingState />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <RouteLoadingState />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
