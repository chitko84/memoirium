import { useEffect, useState } from "react";
import { AdminPageShell, AdminStatCard, AdminState } from "./AdminPageShell";
import { getAdminOverviewStats, type AdminOverviewStats } from "../../services/admin";

export function AdminOverview() {
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminOverviewStats()
      .then(setStats)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load admin stats."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AdminPageShell title="Admin Overview" description="Monitor Memoirium's platform health, public museum growth, and visitor engagement.">
      {isLoading && <AdminState title="Loading platform stats" description="Preparing the admin overview..." />}
      {!isLoading && error && <AdminState title="Unable to load stats" description={error} tone="danger" />}
      {!isLoading && stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Total users" value={stats.totalUsers} />
          <AdminStatCard label="Public museums" value={stats.totalPublicMuseums} />
          <AdminStatCard label="Exhibition rooms" value={stats.totalCollections} />
          <AdminStatCard label="Artifacts" value={stats.totalArtifacts} />
          <AdminStatCard label="Museum visits" value={stats.totalVisits} />
          <AdminStatCard label="Guestbook entries" value={stats.totalGuestbookEntries} />
          <AdminStatCard label="Comments" value={stats.totalComments} />
          <AdminStatCard label="Likes" value={stats.totalLikes} />
        </div>
      )}
    </AdminPageShell>
  );
}
