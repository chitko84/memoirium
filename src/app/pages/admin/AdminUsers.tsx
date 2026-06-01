import { useEffect, useMemo, useState } from "react";
import { AdminPageShell, AdminState, AdminTable, AdminTd, AdminTh, formatAdminDate } from "./AdminPageShell";
import { AdminConfirmModal } from "./AdminConfirmModal";
import { deleteUserProfileAsAdmin, getAdminUsers, type AdminUserRow } from "../../services/admin";
import { useAuth } from "../../auth/AuthContext";

export function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      setUsers(await getAdminUsers());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const confirmDeleteUser = async () => {
    if (!selectedUser || selectedUser.id === currentUser?.id) return;

    setIsDeleting(true);
    setDeleteError("");
    setSuccessMessage("");

    try {
      await deleteUserProfileAsAdmin(selectedUser.id);
      setSelectedUser(null);
      setSuccessMessage(`Deleted ${selectedUser.display_name}.`);
      await loadUsers();
    } catch (deleteError) {
      setDeleteError(deleteError instanceof Error ? deleteError.message : "Unable to delete this user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        user.display_name.toLowerCase().includes(normalizedQuery) ||
        user.username.toLowerCase().includes(normalizedQuery) ||
        (user.email?.toLowerCase().includes(normalizedQuery) ?? false);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [query, roleFilter, users]);

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  return (
    <AdminPageShell title="Users" description="Review curator accounts, museum visibility, collection counts, and account roles.">
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search users by name, username, or email"
          className="border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--gold-primary)]"
        />
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--gold-primary)]"
        >
          <option value="all">All roles</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </select>
      </div>

      {isLoading && <AdminState title="Loading users" description="Preparing the users table..." />}
      {!isLoading && successMessage && (
        <div className="mb-5 rounded-lg border border-[var(--gold-primary)]/30 bg-[var(--gold-primary)]/10 p-4 text-sm text-[var(--gold-secondary)]">
          {successMessage}
        </div>
      )}
      {!isLoading && error && <AdminState title="Unable to load users" description={error} tone="danger" />}
      {!isLoading && !error && filteredUsers.length === 0 && <AdminState title="No users found" description="Try changing the search or filter." />}
      {!isLoading && !error && filteredUsers.length > 0 && (
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>Curator</AdminTh>
              <AdminTh>Username</AdminTh>
              <AdminTh>Email</AdminTh>
              <AdminTh>Museum</AdminTh>
              <AdminTh>Rooms</AdminTh>
              <AdminTh>Artifacts</AdminTh>
              <AdminTh>Created</AdminTh>
              <AdminTh>Role</AdminTh>
              <AdminTh>Action</AdminTh>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <AdminTd>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[var(--gold-primary)]/35 bg-[var(--gold-primary)]/10 text-[13px] font-semibold text-[var(--gold-primary)]">
                      {user.avatar_url && !failedAvatars[user.id] ? (
                        <img
                          src={user.avatar_url}
                          alt={user.display_name}
                          className="h-full w-full object-cover"
                          onError={() => setFailedAvatars((current) => ({ ...current, [user.id]: true }))}
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center">{getInitials(user.display_name)}</span>
                      )}
                    </div>
                    <span className="font-medium text-[var(--text-primary)]">{user.display_name}</span>
                  </div>
                </AdminTd>
                <AdminTd>@{user.username}</AdminTd>
                <AdminTd>{user.email ?? "Not exposed"}</AdminTd>
                <AdminTd>{user.is_public ? "Public" : "Private"}</AdminTd>
                <AdminTd>{user.totalCollections}</AdminTd>
                <AdminTd>{user.totalMemories}</AdminTd>
                <AdminTd>{formatAdminDate(user.created_at)}</AdminTd>
                <AdminTd>
                  <span className="rounded-full border border-[var(--gold-primary)]/35 px-3 py-1 text-xs uppercase text-[var(--gold-primary)]">
                    {user.role}
                  </span>
                </AdminTd>
                <AdminTd>
                  {user.id === currentUser?.id ? (
                    <span className="text-xs text-[var(--text-secondary)]">You cannot delete your own admin account here.</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError("");
                        setSelectedUser(user);
                      }}
                      disabled={isDeleting}
                      className="border border-red-500/35 px-3 py-2 text-xs text-red-200 transition-colors hover:bg-red-500/10 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  )}
                </AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      {selectedUser && (
        <AdminConfirmModal
          title="Delete User?"
          message="This will permanently remove this user profile and their museum content from Memoirium. This does not delete the Supabase Auth account unless handled separately. This action cannot be undone."
          confirmLabel="Delete User"
          isProcessing={isDeleting}
          error={deleteError}
          onCancel={() => {
            if (!isDeleting) {
              setSelectedUser(null);
              setDeleteError("");
            }
          }}
          onConfirm={() => void confirmDeleteUser()}
        />
      )}
    </AdminPageShell>
  );
}
