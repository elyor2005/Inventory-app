"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Image from "next/image";
import { useToast } from '@/components/providers/ToastProvider';
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { Ban, CheckCircle, Sparkles, Minus } from "lucide-react";
interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  blocked: boolean;
  createdAt: string;
  _count: {
    inventories: number;
    items: number;
    comments: number;
  };
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.user.id);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/dashboard");
          return;
        }
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, [fetchCurrentUser, fetchUsers]);

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show specific error message from backend
        showToast(data.error || t("error_update_user"), "error");
        return;
      }

      // Refresh users list
      await fetchUsers();

      // Clear selection after action
      setSelectedUsers(new Set());

      // Show success message
      const actionMessages: Record<string, string> = {
        block: t("user_blocked"),
        unblock: t("user_unblocked"),
        makeAdmin: t("user_role_updated"),
        removeAdmin: t("user_role_updated"),
      };
      showToast(actionMessages[action] || "Action completed", "success");
    } catch (error) {
      console.error("Error updating user:", error);
      showToast(t("error_update_user"), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    totalUsers: users.length,
    totalInventories: users.reduce((sum, u) => sum + u._count.inventories, 0),
    totalItems: users.reduce((sum, u) => sum + u._count.items, 0),
    blockedUsers: users.filter((u) => u.blocked).length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t("admin_dashboard")}</h1>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("total_users")}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("total_inventories")}</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalInventories}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("total_items")}</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalItems}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("admins")}</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.admins}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("blocked")}</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.blockedUsers}</p>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("user_management")}</h2>
            </div>

            {/* Action Toolbar */}
            {!loading && users.length > 0 && (
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedUsers.size > 0
                      ? `${selectedUsers.size} ${t("selected") || "selected"}`
                      : t("no_users_selected") || "No users selected"}
                  </span>
                  {selectedUsers.size === 1 && (() => {
                    const userId = Array.from(selectedUsers)[0];
                    const user = users.find(u => u.id === userId);
                    const isCurrentUser = userId === currentUserId;
                    const isOtherAdmin = user?.role === "admin" && !isCurrentUser;

                    return (
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {!user?.blocked ? (
                          <button
                            onClick={() => handleUserAction(userId, "block")}
                            disabled={actionLoading === userId || isCurrentUser || isOtherAdmin}
                            className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded transition flex items-center gap-1 flex-1 sm:flex-initial justify-center"
                            title={isCurrentUser ? t("cannot_block_yourself") : isOtherAdmin ? t("cannot_block_other_admins") : ""}
                          >
                            <Ban className="w-4 h-4" />
                            <span className="hidden sm:inline">{t("block_user") || "Block"}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(userId, "unblock")}
                            disabled={actionLoading === userId}
                            className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded transition flex items-center gap-1 flex-1 sm:flex-initial justify-center"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">{t("unblock_user") || "Unblock"}</span>
                          </button>
                        )}
                        {user?.role !== "admin" ? (
                          <button
                            onClick={() => handleUserAction(userId, "makeAdmin")}
                            disabled={actionLoading === userId}
                            className="px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded transition flex items-center gap-1 flex-1 sm:flex-initial justify-center"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span className="hidden sm:inline">{t("make_admin") || "Admin"}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(userId, "removeAdmin")}
                            disabled={actionLoading === userId || isOtherAdmin}
                            className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded transition flex items-center gap-1 flex-1 sm:flex-initial justify-center"
                            title={isOtherAdmin ? t("cannot_demote_other_admins") : ""}
                          >
                            <Minus className="w-4 h-4" />
                            <span className="hidden sm:inline">{t("remove_admin") || "Remove"}</span>
                          </button>
                        )}
                      </div>
                    );
                  })()}
                  {selectedUsers.size > 0 && (
                    <button
                      onClick={() => setSelectedUsers(new Set())}
                      className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded transition w-full sm:w-auto"
                    >
                      {t("clear_selection") || "Clear"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {loading ? (
              <div className="p-6">
                <TableSkeleton rows={8} />
              </div>
            ) : (
              <>
                {/* Mobile Card Layout */}
                <div className="md:hidden p-4 space-y-4">
                  {users.map((user) => {
                    const isCurrentUser = user.id === currentUserId;
                    return (
                      <div key={user.id} className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${isCurrentUser ? "bg-blue-50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-700" : "bg-white dark:bg-gray-800"}`}>
                        {/* Header with Checkbox and Status */}
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                          />
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.blocked ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}`}>
                            {user.blocked ? t("blocked") : t("active")}
                          </span>
                        </div>

                        {/* User Info */}
                        <div className="flex items-start gap-3 mb-3">
                          <Image src={user.image || "/default-avatar.png"} alt={user.name} width={48} height={48} className="rounded-full flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</h3>
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 flex-shrink-0">
                                  {t("you")}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                            <span className={`inline-flex mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>
                              {user.role}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-3 text-center text-sm">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{user._count.inventories}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{t("inventories")}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{user._count.items}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{t("items")}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{user._count.comments}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{t("comments")}</div>
                          </div>
                        </div>

                        {/* Joined Date */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          {t("joined") || "Joined"}: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="w-12 px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.size === users.length && users.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("admin.table.user")}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("admin.table.role")}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("admin.table.status")}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("admin.table.sessions")}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("admin.table.joined")}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => {
                        const isCurrentUser = user.id === currentUserId;
                        return (
                        <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isCurrentUser ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}>
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.has(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Image src={user.image || "/default-avatar.png"} alt={user.name} width={40} height={40} className="rounded-full" />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                  {user.name}
                                  {isCurrentUser && (
                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                      {t("you")}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>{user.role}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.blocked ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}`}>{user.blocked ? t("blocked") : t("active")}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div>{user._count.inventories} {t("inventories").toLowerCase()}</div>
                            <div>{user._count.items} {t("items")}</div>
                            <div>{user._count.comments} {t("comments")}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
