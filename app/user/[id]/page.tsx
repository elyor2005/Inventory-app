"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { TableSkeleton } from "@/components/LoadingSkeleton";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
}

interface Inventory {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string | null;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  _count: {
    items: number;
  };
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();

  const [user, setUser] = useState<User | null>(null);
  const [ownedInventories, setOwnedInventories] = useState<Inventory[]>([]);
  const [accessibleInventories, setAccessibleInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${params.id}/inventories`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setOwnedInventories(data.ownedInventories);
        setAccessibleInventories(data.accessibleInventories);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
        <Header />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4">
            <div className="space-y-4 mb-8 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
            </div>
            <TableSkeleton rows={5} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t("user_not_found") || "User not found"}</div>
      </div>
    );
  }

  const isOwnProfile = session?.user.id === user.id;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* User Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    fill
                    className="rounded-full object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-3xl font-semibold">
                    {(user.name || user.email)?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {user.name || user.email}
                  </h1>
                  {isOwnProfile && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm font-medium rounded-full">
                      {t("you") || "You"}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {t("member_since") || "Member since"} {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {ownedInventories.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("owned_inventories") || "Owned Inventories"}
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {accessibleInventories.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("accessible_inventories") || "Accessible Inventories"}
                </div>
              </div>
            </div>
          </div>

          {/* Owned Inventories Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("owned_inventories") || "Owned Inventories"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {ownedInventories.length} {ownedInventories.length === 1 ? t("inventory") || "inventory" : t("inventories") || "inventories"}
              </p>
            </div>

            <div className="overflow-x-auto">
              {ownedInventories.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {isOwnProfile
                    ? t("no_owned_inventories_you") || "You haven't created any inventories yet"
                    : t("no_owned_inventories") || "This user hasn't created any inventories yet"}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("inventory_name") || "Name"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("category") || "Category"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("visibility") || "Visibility"}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("items") || "Items"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("last_updated") || "Last Updated"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {ownedInventories.map((inventory) => (
                      <tr
                        key={inventory.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/inventories/${inventory.id}`}
                            className="flex items-center gap-3 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {inventory.image && (
                              <div className="relative w-12 h-12 flex-shrink-0">
                                <Image
                                  src={inventory.image}
                                  alt={inventory.title}
                                  fill
                                  className="rounded object-cover"
                                  sizes="48px"
                                />
                              </div>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {inventory.title}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm font-medium rounded-full">
                            {inventory.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {inventory.isPublic ? (
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-medium rounded-full">
                              {t("public") || "Public"}
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-sm font-medium rounded-full">
                              {t("private") || "Private"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-gray-900 dark:text-white font-medium">
                            {inventory._count.items}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(inventory.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Accessible Inventories Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("accessible_inventories") || "Accessible Inventories"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isOwnProfile
                  ? t("accessible_inventories_desc_you") || "Inventories shared with you"
                  : t("accessible_inventories_desc") || "Inventories this user has access to"}
              </p>
            </div>

            <div className="overflow-x-auto">
              {accessibleInventories.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {isOwnProfile
                    ? t("no_accessible_inventories_you") || "No inventories have been shared with you yet"
                    : t("no_accessible_inventories") || "This user doesn't have access to any shared inventories"}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("inventory_name") || "Name"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("owner") || "Owner"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("category") || "Category"}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("items") || "Items"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t("last_updated") || "Last Updated"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {accessibleInventories.map((inventory) => (
                      <tr
                        key={inventory.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/inventories/${inventory.id}`}
                            className="flex items-center gap-3 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {inventory.image && (
                              <div className="relative w-12 h-12 flex-shrink-0">
                                <Image
                                  src={inventory.image}
                                  alt={inventory.title}
                                  fill
                                  className="rounded object-cover"
                                  sizes="48px"
                                />
                              </div>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {inventory.title}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/user/${inventory.creator.id}`}
                            className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {inventory.creator.image && (
                              <div className="relative w-8 h-8">
                                <Image
                                  src={inventory.creator.image}
                                  alt={inventory.creator.name || "Owner"}
                                  fill
                                  className="rounded-full object-cover"
                                  sizes="32px"
                                />
                              </div>
                            )}
                            <span className="text-sm text-gray-900 dark:text-white">
                              {inventory.creator.name || inventory.creator.email}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm font-medium rounded-full">
                            {inventory.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-gray-900 dark:text-white font-medium">
                            {inventory._count.items}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(inventory.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
