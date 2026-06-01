import { useEffect, useMemo, useState } from "react";
import { AdminPageShell, AdminState, AdminTable, AdminTd, AdminTh, formatAdminDate } from "./AdminPageShell";
import { getAdminUsers, type AdminUserRow } from "../../services/admin";

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load users."))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        user.display_name.toLowerCase().includes(normalizedQuery) ||
        user.username.toLowerCase().includes(normalizedQuery);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [query, roleFilter, users]);

  return (
    <AdminPageShell title="Users" description="Review curator accounts, museum visibility, collection counts, and account roles.">
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search users by name or username"
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
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <AdminTd>{user.display_name}</AdminTd>
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
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </AdminPageShell>
  );
}
