import { useEffect, useState } from "react";
import { AdminPageShell, AdminStatCard, AdminState, AdminTable, AdminTd, AdminTh } from "./AdminPageShell";
import { getAdminAnalytics, type AdminAnalytics } from "../../services/admin";

function RankingTable({
  title,
  rows,
  nameLabel,
}: {
  title: string;
  rows: Array<{ id: string; title: string; count: number }>;
  nameLabel: string;
}) {
  return (
    <section>
      <h2 className="mb-4 text-2xl text-[var(--gold-primary)]">{title}</h2>
      {rows.length === 0 ? (
        <AdminState title="No data yet" description="This ranking will populate as visitors interact with public museums." />
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>{nameLabel}</AdminTh>
              <AdminTh>Count</AdminTh>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <AdminTd>{row.title}</AdminTd>
                <AdminTd>{row.count}</AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </section>
  );
}

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminAnalytics()
      .then(setAnalytics)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load analytics."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AdminPageShell title="Analytics" description="Track museum reach, artifact engagement, and recent public activity across Memoirium.">
      {isLoading && <AdminState title="Loading analytics" description="Preparing platform engagement metrics..." />}
      {!isLoading && error && <AdminState title="Unable to load analytics" description={error} tone="danger" />}
      {!isLoading && analytics && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {analytics.recentActivity.map((activity) => (
              <AdminStatCard key={activity.label} label={`${activity.label} in last 7 days`} value={activity.count} />
            ))}
          </div>

          <RankingTable
            title="Most Visited Museums"
            nameLabel="Museum"
            rows={analytics.mostVisitedMuseums.map((museum) => ({
              id: museum.id,
              title: `${museum.title} (@${museum.username})`,
              count: museum.count,
            }))}
          />
          <RankingTable title="Most Liked Artifacts" nameLabel="Artifact" rows={analytics.mostLikedArtifacts} />
          <RankingTable title="Most Commented Artifacts" nameLabel="Artifact" rows={analytics.mostCommentedArtifacts} />
        </div>
      )}
    </AdminPageShell>
  );
}
