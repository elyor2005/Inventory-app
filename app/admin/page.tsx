"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Image from "next/image";

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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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
  };

  const handleUserAction = async (userId: string, action: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Refresh users list
      await fetchUsers();

      // Show success message
      const actionMessages: Record<string, string> = {
        block: t("user_blocked"),
        unblock: t("user_unblocked"),
        makeAdmin: t("user_role_updated"),
        removeAdmin: t("user_role_updated"),
      };
      alert(actionMessages[action] || "Action completed");
    } catch (error) {
      console.error("Error updating user:", error);
      alert(t("error_update_user"));
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
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("admin")}s</p>
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

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">{t("loading")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("user")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("role")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("status")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("statistics")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("joined")}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Image src={user.image || "/default-avatar.png"} alt={user.name} width={40} height={40} className="rounded-full" />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
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
                          <div>{user._count.inventories} inventories</div>
                          <div>{user._count.items} items</div>
                          <div>{user._count.comments} comments</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {!user.blocked ? (
                              <button onClick={() => handleUserAction(user.id, "block")} disabled={actionLoading === user.id} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50">
                                {t("block_user")}
                              </button>
                            ) : (
                              <button onClick={() => handleUserAction(user.id, "unblock")} disabled={actionLoading === user.id} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50">
                                {t("unblock_user")}
                              </button>
                            )}

                            {user.role !== "admin" ? (
                              <button onClick={() => handleUserAction(user.id, "makeAdmin")} disabled={actionLoading === user.id} className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 disabled:opacity-50">
                                {t("make_admin")}
                              </button>
                            ) : (
                              <button onClick={() => handleUserAction(user.id, "removeAdmin")} disabled={actionLoading === user.id} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50">
                                {t("remove_admin")}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
