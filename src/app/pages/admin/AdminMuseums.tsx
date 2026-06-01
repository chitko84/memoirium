import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { AdminPageShell, AdminState, AdminTable, AdminTd, AdminTh } from "./AdminPageShell";
import { AdminConfirmModal } from "./AdminConfirmModal";
import { deleteMuseumAsAdmin, getAdminMuseums, type AdminMuseumRow } from "../../services/admin";

export function AdminMuseums() {
  const [museums, setMuseums] = useState<AdminMuseumRow[]>([]);
  const [query, setQuery] = useState("");
  const [selectedMuseum, setSelectedMuseum] = useState<AdminMuseumRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadMuseums = async () => {
    setIsLoading(true);
    setError("");
    try {
      setMuseums(await getAdminMuseums());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load museums.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAdminMuseums()
      .then(setMuseums)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load museums."))
      .finally(() => setIsLoading(false));
  }, []);

  const confirmDeleteMuseum = async () => {
    if (!selectedMuseum) return;

    setIsDeleting(true);
    setDeleteError("");
    setSuccessMessage("");

    try {
      await deleteMuseumAsAdmin(selectedMuseum.id);
      setSelectedMuseum(null);
      setSuccessMessage(`Deleted ${selectedMuseum.museum_title}.`);
      await loadMuseums();
    } catch (deleteError) {
      setDeleteError(deleteError instanceof Error ? deleteError.message : "Unable to delete this museum.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMuseums = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return museums.filter(
      (museum) =>
        !normalizedQuery ||
        museum.museum_title.toLowerCase().includes(normalizedQuery) ||
        museum.username.toLowerCase().includes(normalizedQuery) ||
        museum.display_name.toLowerCase().includes(normalizedQuery),
    );
  }, [museums, query]);

  return (
    <AdminPageShell title="Museums" description="Review public museum listings, room counts, artifact depth, and visitor traction.">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search museums by title, username, or display name"
        className="mb-5 w-full border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--gold-primary)]"
      />

      {isLoading && <AdminState title="Loading museums" description="Preparing public museum inventory..." />}
      {!isLoading && successMessage && (
        <div className="mb-5 rounded-lg border border-[var(--gold-primary)]/30 bg-[var(--gold-primary)]/10 p-4 text-sm text-[var(--gold-secondary)]">
          {successMessage}
        </div>
      )}
      {!isLoading && error && <AdminState title="Unable to load museums" description={error} tone="danger" />}
      {!isLoading && !error && filteredMuseums.length === 0 && <AdminState title="No museums found" description="No public museums match this search." />}
      {!isLoading && !error && filteredMuseums.length > 0 && (
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>Museum</AdminTh>
              <AdminTh>Username</AdminTh>
              <AdminTh>Display name</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Rooms</AdminTh>
              <AdminTh>Artifacts</AdminTh>
              <AdminTh>Visits</AdminTh>
              <AdminTh>Link</AdminTh>
              <AdminTh>Action</AdminTh>
            </tr>
          </thead>
          <tbody>
            {filteredMuseums.map((museum) => (
              <tr key={museum.id}>
                <AdminTd>{museum.museum_title}</AdminTd>
                <AdminTd>@{museum.username}</AdminTd>
                <AdminTd>{museum.display_name}</AdminTd>
                <AdminTd>{museum.is_public ? "Public" : "Private"}</AdminTd>
                <AdminTd>{museum.roomCount}</AdminTd>
                <AdminTd>{museum.memoryCount}</AdminTd>
                <AdminTd>{museum.visitCount}</AdminTd>
                <AdminTd>
                  <a
                    href={`/museum/${museum.username}`}
                    className="inline-flex items-center gap-2 text-[var(--gold-primary)] hover:underline"
                  >
                    Open
                    <ExternalLink size={14} />
                  </a>
                </AdminTd>
                <AdminTd>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError("");
                      setSelectedMuseum(museum);
                    }}
                    disabled={isDeleting}
                    className="border border-red-500/35 px-3 py-2 text-xs text-red-200 transition-colors hover:bg-red-500/10 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      {selectedMuseum && (
        <AdminConfirmModal
          title="Delete Museum?"
          message="This will permanently delete this curator's museum data, including exhibition rooms, artifacts, guestbook entries, comments, likes, visits, and uploaded image references. This action cannot be undone."
          confirmLabel="Delete Museum"
          isProcessing={isDeleting}
          error={deleteError}
          onCancel={() => {
            if (!isDeleting) {
              setSelectedMuseum(null);
              setDeleteError("");
            }
          }}
          onConfirm={() => void confirmDeleteMuseum()}
        />
      )}
    </AdminPageShell>
  );
}
