import { useEffect, useState } from "react";
import {
  deleteGuestbookEntryAsAdmin,
  deleteMemoryCommentAsAdmin,
  getAdminModerationItems,
  type AdminModerationItem,
} from "../../services/admin";
import { AdminPageShell, AdminState, formatAdminDate } from "./AdminPageShell";

export function AdminModeration() {
  const [items, setItems] = useState<AdminModerationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadItems = async () => {
    setIsLoading(true);
    setError("");
    try {
      setItems(await getAdminModerationItems());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load moderation queue.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const deleteItem = async (item: AdminModerationItem) => {
    const confirmed = window.confirm(`Delete this ${item.type} entry from ${item.visitor_name}?`);
    if (!confirmed) return;

    setDeletingId(item.id);
    setError("");
    try {
      if (item.type === "guestbook") {
        await deleteGuestbookEntryAsAdmin(item.id);
      } else {
        await deleteMemoryCommentAsAdmin(item.id);
      }
      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete moderation item.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminPageShell title="Moderation" description="Review recent guestbook entries and artifact comments, then remove content when needed.">
      {isLoading && <AdminState title="Loading moderation queue" description="Collecting recent public interaction..." />}
      {!isLoading && error && <div className="mb-5"><AdminState title="Moderation action failed" description={error} tone="danger" /></div>}
      {!isLoading && items.length === 0 && !error && <AdminState title="No moderation items" description="There are no guestbook entries or comments to review." />}
      {!isLoading && items.length > 0 && (
        <div className="grid gap-4">
          {items.map((item) => (
            <article key={`${item.type}-${item.id}`} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[var(--gold-primary)]/35 px-3 py-1 text-xs uppercase text-[var(--gold-primary)]">
                      {item.type}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)]">{formatAdminDate(item.created_at)}</span>
                  </div>
                  <h2 className="text-xl text-[var(--gold-primary)]">{item.visitor_name}</h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {item.museumTitle}
                    {item.memoryTitle ? ` / ${item.memoryTitle}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteItem(item)}
                  disabled={deletingId === item.id}
                  className="border border-red-500/35 px-4 py-2 text-sm text-red-200 transition-colors hover:bg-red-500/10 disabled:opacity-60"
                >
                  {deletingId === item.id ? "Deleting..." : "Delete"}
                </button>
              </div>
              <p className="leading-relaxed text-[var(--text-primary)]">{item.body}</p>
            </article>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
