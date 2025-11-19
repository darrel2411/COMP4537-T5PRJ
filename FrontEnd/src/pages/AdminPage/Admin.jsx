import React, { useEffect, useMemo, useState } from "react";
import LogoutButton from "../../components/auth/LogoutButton";

export default function Admin() {
  const API_BASE = import.meta.env.VITE_API_BASE;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/get-all-users`, {
        method: "GET",
        credentials: "include", // keep if using sessions/cookies
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (e) {
      setErr(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) =>
      [u.id, u.name, u.email, u.user_type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [q, users]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Admin — Users
          </h1>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name/email/type…"
              className="px-3 py-2 rounded-lg border bg-white text-sm"
            />
            <button
              onClick={fetchUsers}
              className="px-3 py-2 rounded-lg bg-black text-white text-sm"
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <LogoutButton />
          </div>
        </div>

        <div className=" overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 w-24">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                // simple skeleton rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : err ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-red-600">
                    {err}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.user_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{u.user_id}</td>
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.user_type}</td>
                    <td className="px-4 py-3">
                      <button
                        className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100"
                        onClick={() => alert(`User: ${u.name}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500">
          Endpoint: <code>{API_BASE}/users</code>
        </p>
      </div>
    </div>
  );
}
