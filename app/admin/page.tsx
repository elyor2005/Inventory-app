"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  blocked: boolean;
  createdAt: string;
  _count: {
    sessions: number;
  };
}

export default function AdminPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Check if user is admin
  useEffect(() => {
    if (!isPending && (!session || session.user.role !== "admin")) {
      router.push("/");
    }
  }, [session, isPending, router]);

  // Fetch users
  useEffect(() => {
    if (session?.user.role === "admin") {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (userId: string, currentBlocked: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: !currentBlocked }),
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error toggling block:", error);
    }
  };

  const toggleAdmin = async (userId: string) => {
    if (userId === session?.user.id) {
      const confirmed = confirm("Are you sure you want to remove your own admin access? You will not be able to access this page anymore.");
      if (!confirmed) return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (response.ok) {
        await fetchUsers();

        // If admin removed own access, redirect to home
        if (data.removedOwnAdmin) {
          alert("Your admin access has been removed.");
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Error toggling admin:", error);
    }
  };

  const deleteUser = async (userId: string) => {
    const confirmed = confirm("Are you sure you want to delete this user? This action cannot be undone.");

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  const bulkBlock = async () => {
    for (const userId of selectedUsers) {
      const user = users.find((u) => u.id === userId);
      if (user && !user.blocked) {
        await toggleBlock(userId, false);
      }
    }
    setSelectedUsers(new Set());
  };

  const bulkDelete = async () => {
    const confirmed = confirm(`Delete ${selectedUsers.size} users? This cannot be undone.`);
    if (!confirmed) return;

    for (const userId of selectedUsers) {
      if (userId !== session?.user.id) {
        await deleteUser(userId);
      }
    }
    setSelectedUsers(new Set());
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage all users, roles, and permissions</p>
          </div>

          {/* Toolbar */}
          {selectedUsers.size > 0 && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedUsers.size} user(s) selected</span>
              <div className="flex gap-2">
                <button onClick={bulkBlock} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition">
                  Block Selected
                </button>
                <button onClick={bulkDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition">
                  Delete Selected
                </button>
                <button onClick={() => setSelectedUsers(new Set())} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input type="checkbox" checked={selectedUsers.size === users.length} onChange={selectAll} className="rounded" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sessions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedUsers.has(user.id) ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}>
                      <td className="px-6 py-4">
                        <input type="checkbox" checked={selectedUsers.has(user.id)} onChange={() => toggleSelectUser(user.id)} className="rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.image && <img src={user.image} alt={user.name || "User"} className="w-10 h-10 rounded-full" />}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{user.name || "No name"}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === "admin" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>{user.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.blocked ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}`}>{user.blocked ? "Blocked" : "Active"}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{user._count.sessions}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => toggleBlock(user.id, user.blocked)} className={`text-sm font-medium ${user.blocked ? "text-green-600 hover:text-green-700 dark:text-green-400" : "text-orange-600 hover:text-orange-700 dark:text-orange-400"}`}>
                          {user.blocked ? "Unblock" : "Block"}
                        </button>
                        <button onClick={() => toggleAdmin(user.id)} className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                          {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                        </button>
                        {user.id !== session.user.id && (
                          <button onClick={() => deleteUser(user.id)} className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400">
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {users.length === 0 && <div className="text-center py-12 text-gray-500 dark:text-gray-400">No users found</div>}
        </div>
      </main>

      <Footer />
    </div>
  );
}
