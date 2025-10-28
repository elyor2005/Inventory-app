/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useToast } from "@/components/providers/ToastProvider";
import ItemsList from "@/components/ItemsList";
import { ItemCardSkeleton } from "@/components/LoadingSkeleton";
import InventoryDiscussion from "@/components/InventoryDiscussion";

interface Inventory {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string | null;
  isPublic: boolean;
  tags: string[];
  customFields: any[];
  customIdFormat: any[];
  allowedUsers: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
  creator: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [statistics, setStatistics] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Access settings state
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [allowedUsersList, setAllowedUsersList] = useState<any[]>([]);
  const [savingAccess, setSavingAccess] = useState(false);

  // Load allowed users details when access tab is active
  useEffect(() => {
    if (activeTab === "access" && inventory && allowedUsersList.length === 0 && inventory.allowedUsers.length > 0) {
      fetchAllowedUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, inventory]);

  // Search users with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearch.trim().length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearch]);

  useEffect(() => {
    if (params.id) {
      fetchInventory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Fetch statistics when statistics tab is active
  useEffect(() => {
    if (activeTab === "statistics" && !statistics) {
      fetchStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inventories/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory);
      } else {
        router.push("/inventories");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      router.push("/inventories");
    } finally {
      setLoading(false);
    }
  };

  const deleteInventory = async () => {
    if (!confirm(t("inventory.detail.deleteConfirm"))) {
      return;
    }

    try {
      const response = await fetch(`/api/inventories/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/inventories");
      }
    } catch (error) {
      console.error("Error deleting inventory:", error);
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
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t("inventory.detail.notFound")}</div>
      </div>
    );
  }

  const isOwner = session?.user.id === inventory.creator.id;
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  const canEdit = isOwner || isAdmin;

  const tabs = [
    { id: "overview", label: t("inventory.detail.tabs.overview") },
    { id: "items", label: t("inventory.detail.tabs.items") },
    { id: "discussion", label: t("inventory.detail.tabs.discussion") || "Discussion" },
    { id: "statistics", label: t("inventory.detail.tabs.statistics") || "Statistics" },
    { id: "settings", label: t("inventory.detail.tabs.settings"), requiresEdit: true },
    { id: "fields", label: t("inventory.detail.tabs.fields"), requiresEdit: true },
    { id: "customid", label: t("inventory.detail.tabs.customid"), requiresEdit: true },
    { id: "access", label: t("inventory.detail.tabs.access"), requiresEdit: true },
  ];

  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch(`/api/inventories/${params.id}/statistics`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAllowedUsers = async () => {
    if (!inventory) return;

    try {
      const userPromises = inventory.allowedUsers.map(async (userId) => {
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          return await res.json();
        }
        return null;
      });

      const users = await Promise.all(userPromises);
      setAllowedUsersList(users.filter(Boolean));
    } catch (error) {
      console.error("Error fetching allowed users:", error);
    }
  };

  const searchUsers = async () => {
    setSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(userSearch)}`);
      if (response.ok) {
        const data = await response.json();
        // Filter out users already in allowed list
        const filtered = data.users.filter(
          (user: any) => !inventory?.allowedUsers.includes(user.id)
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  const addAllowedUser = (user: any) => {
    setAllowedUsersList([...allowedUsersList, user]);
    setUserSearch("");
    setSearchResults([]);
  };

  const removeAllowedUser = (userId: string) => {
    setAllowedUsersList(allowedUsersList.filter(u => u.id !== userId));
  };

  const saveAccessSettings = async () => {
    if (!inventory) return;

    setSavingAccess(true);
    try {
      const response = await fetch(`/api/inventories/${inventory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowedUsers: allowedUsersList.map(u => u.id),
          version: inventory.version,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory);
        showToast(t("access_settings_saved") || "Access settings saved successfully", "success");
      } else {
        showToast(t("error_saving_access") || "Failed to save access settings", "error");
      }
    } catch (error) {
      console.error("Error saving access settings:", error);
      showToast(t("error_saving_access") || "Failed to save access settings", "error");
    } finally {
      setSavingAccess(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <Link href="/inventories" className="hover:text-blue-600 dark:hover:text-blue-400">
                {t("inventory.detail.myInventories")}
              </Link>
              <span>→</span>
              <span>{inventory.title}</span>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{inventory.title}</h1>
                  {inventory.isPublic && <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-medium rounded-full">{t("inventories.public")}</span>}
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm font-medium rounded-full">{inventory.category}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  {inventory.creator.image && (
                    <div className="relative w-6 h-6">
                      <Image src={inventory.creator.image} alt={inventory.creator.name || "User"} fill className="rounded-full object-cover" sizes="24px" />
                    </div>
                  )}
                  <span>
                    {t("inventory.detail.createdBy")} {inventory.creator.name || inventory.creator.email}
                  </span>
                  <span>•</span>
                  <span>{new Date(inventory.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {canEdit && (
                <div className="flex gap-2">
                  <Link href={`/inventories/${inventory.id}/edit`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                    {t("common.edit")}
                  </Link>
                  <button onClick={deleteInventory} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition">
                    {t("common.delete")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b dark:border-gray-700">
            <div className="flex gap-4 overflow-x-auto">
              {tabs.map((tab) => {
                if (tab.requiresEdit && !canEdit) return null;

                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${activeTab === tab.id ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Image */}
                {inventory.image && (
                  <div className="mb-6 relative w-full h-96 rounded-lg overflow-hidden">
                    <Image src={inventory.image} alt={inventory.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px" />
                  </div>
                )}

                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t("inventory.detail.overview.description")}</h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{inventory.description}</ReactMarkdown>
                  </div>
                </div>

                {/* Tags */}
                {inventory.tags.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t("inventory.detail.overview.tags")}</h2>
                    <div className="flex flex-wrap gap-2">
                      {inventory.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Fields Section - Preview in Overview */}
                {inventory.customFields && Array.isArray(inventory.customFields) && inventory.customFields.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span>⚙️</span>
                      {t("inventory.detail.overview.customFields")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(inventory.customFields as any[]).slice(0, 6).map((field, index) => (
                        <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{field.label}</span>
                                {field.required && <span className="text-xs text-red-500">*</span>}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{field.type}</span>
                            </div>
                            <span className="text-lg ml-2">
                              {field.type === "string" && "📝"}
                              {field.type === "text" && "📄"}
                              {field.type === "integer" && "🔢"}
                              {field.type === "date" && "📅"}
                              {field.type === "boolean" && "☑️"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {inventory.customFields.length > 6 && canEdit && (
                      <button onClick={() => setActiveTab("fields")} className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        {t("inventory.detail.overview.viewAllFields").replace("{count}", inventory.customFields.length.toString())} →
                      </button>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4 pt-6 border-t dark:border-gray-700">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t("inventory.detail.overview.stats.totalItems")}</div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{inventory.allowedUsers.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t("inventory.detail.overview.stats.usersWithAccess")}</div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{new Date(inventory.updatedAt).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t("inventory.detail.overview.stats.lastUpdated")}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "items" && (
              <div>
                <ItemsList inventoryId={inventory.id} canEdit={canEdit} isPublic={inventory.isPublic} />
              </div>
            )}

            {activeTab === "discussion" && (
              <div>
                <InventoryDiscussion inventoryId={inventory.id} canComment={!!session} />
              </div>
            )}

            {activeTab === "statistics" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("statistics_title") || "Inventory Statistics"}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("statistics_subtitle") || "Statistical analysis of your inventory data"}</p>
                </div>

                {statsLoading ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">{t("loading") || "Loading statistics..."}</div>
                  </div>
                ) : !statistics ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">{t("no_statistics") || "No statistics available"}</div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Total Items Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">{t("total_items") || "Total Items"}</div>
                          <div className="text-4xl font-bold text-blue-900 dark:text-blue-100">{statistics.totalItems}</div>
                        </div>
                        <div className="text-6xl opacity-20">📦</div>
                      </div>
                    </div>

                    {/* Numeric Fields Statistics */}
                    {Object.keys(statistics.numericFields).length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <span className="text-2xl">🔢</span>
                          {t("numeric_statistics") || "Numeric Field Statistics"}
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(statistics.numericFields).map(([fieldName, stats]: [string, any]) => {
                            const field = inventory.customFields.find((f: any) => f.name === fieldName);
                            const range = stats.max - stats.min;
                            return (
                              <div key={fieldName} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                                <div className="font-medium text-gray-900 dark:text-white mb-3">{field?.label || fieldName}</div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">{t("average") || "Average"}:</span>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.avg}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">{t("minimum") || "Minimum"}:</span>
                                    <span className="font-semibold text-green-600 dark:text-green-400">{stats.min}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">{t("maximum") || "Maximum"}:</span>
                                    <span className="font-semibold text-red-600 dark:text-red-400">{stats.max}</span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">{t("range") || "Range"}:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{range}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-500 dark:text-gray-500">{t("data_points") || "Data points"}:</span>
                                    <span className="text-gray-700 dark:text-gray-300">{stats.count}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* String/Text Fields - Most Common Values */}
                    {Object.keys(statistics.stringFields).length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <span className="text-2xl">📝</span>
                          {t("text_field_statistics") || "Text Field Statistics"}
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {Object.entries(statistics.stringFields).map(([fieldName, stats]: [string, any]) => {
                            const field = inventory.customFields.find((f: any) => f.name === fieldName);
                            const sortedValues = Object.entries(stats.values as Record<string, number>)
                              .sort((a, b) => (b[1] as number) - (a[1] as number))
                              .slice(0, 5);
                            return (
                              <div key={fieldName} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                                <div className="font-medium text-gray-900 dark:text-white mb-3">{field?.label || fieldName}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t("most_common_values") || "Most common values"} ({stats.totalCount} {t("total") || "total"})</div>
                                <div className="space-y-2">
                                  {sortedValues.map(([value, count]) => {
                                    const percentage = ((count as number) / stats.totalCount) * 100;
                                    return (
                                      <div key={value}>
                                        <div className="flex justify-between text-sm mb-1">
                                          <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]" title={value}>{value}</span>
                                          <span className="text-gray-600 dark:text-gray-400 ml-2 whitespace-nowrap">{count} ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                          <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Boolean Fields Distribution */}
                    {Object.keys(statistics.booleanFields).length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <span className="text-2xl">☑️</span>
                          {t("boolean_field_statistics") || "Boolean Field Statistics"}
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          {Object.entries(statistics.booleanFields).map(([fieldName, stats]: [string, any]) => {
                            const field = inventory.customFields.find((f: any) => f.name === fieldName);
                            const truePercentage = (stats.trueCount / stats.totalCount) * 100;
                            const falsePercentage = (stats.falseCount / stats.totalCount) * 100;
                            return (
                              <div key={fieldName} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                                <div className="font-medium text-gray-900 dark:text-white mb-4">{field?.label || fieldName}</div>
                                <div className="space-y-3">
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="text-green-600 dark:text-green-400">✓ {t("yes") || "Yes"}</span>
                                      <span className="font-semibold">{stats.trueCount} ({truePercentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div className="bg-green-600 dark:bg-green-500 h-2 rounded-full" style={{ width: `${truePercentage}%` }}></div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="text-red-600 dark:text-red-400">✗ {t("no") || "No"}</span>
                                      <span className="font-semibold">{stats.falseCount} ({falsePercentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div className="bg-red-600 dark:bg-red-500 h-2 rounded-full" style={{ width: `${falsePercentage}%` }}></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Date Fields Range */}
                    {Object.keys(statistics.dateFields).length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <span className="text-2xl">📅</span>
                          {t("date_field_statistics") || "Date Field Statistics"}
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(statistics.dateFields).map(([fieldName, stats]: [string, any]) => {
                            const field = inventory.customFields.find((f: any) => f.name === fieldName);
                            return (
                              <div key={fieldName} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                                <div className="font-medium text-gray-900 dark:text-white mb-3">{field?.label || fieldName}</div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">{t("earliest") || "Earliest"}:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{new Date(stats.earliest).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">{t("latest") || "Latest"}:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{new Date(stats.latest).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex justify-between text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-500 dark:text-gray-500">{t("data_points") || "Data points"}:</span>
                                    <span className="text-gray-700 dark:text-gray-300">{stats.count}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* No Custom Fields Message */}
                    {Object.keys(statistics.numericFields).length === 0 &&
                      Object.keys(statistics.stringFields).length === 0 &&
                      Object.keys(statistics.booleanFields).length === 0 &&
                      Object.keys(statistics.dateFields).length === 0 && (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-6xl mb-4">📊</div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("no_field_statistics") || "No field statistics available"}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{t("add_custom_fields_for_stats") || "Add custom fields to your inventory to see detailed statistics"}</p>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && canEdit && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">{t("inventory.detail.settings.comingSoon")}</p>
              </div>
            )}

            {activeTab === "fields" && canEdit && (
              <div>
                {inventory.customFields && Array.isArray(inventory.customFields) && inventory.customFields.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("inventory.detail.fields.title")}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t("inventory.detail.fields.subtitle")}</p>
                      </div>
                      <Link href={`/inventories/${inventory.id}/edit`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm">
                        {t("inventory.detail.fields.editButton")}
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(inventory.customFields as any[]).map((field, index) => (
                        <div key={index} className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">{field.label}</span>
                                {field.required && <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">{t("inventory.detail.fields.required")}</span>}
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{field.type}</span>
                              </div>
                              <code className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{field.name}</code>
                            </div>
                            <span className="text-2xl">
                              {field.type === "string" && "📝"}
                              {field.type === "text" && "📄"}
                              {field.type === "integer" && "🔢"}
                              {field.type === "date" && "📅"}
                              {field.type === "boolean" && "☑️"}
                            </span>
                          </div>

                          {/* Field Type Description */}
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {field.type === "string" && t("inventory.detail.fields.types.string")}
                              {field.type === "text" && t("inventory.detail.fields.types.text")}
                              {field.type === "integer" && t("inventory.detail.fields.types.integer")}
                              {field.type === "date" && t("inventory.detail.fields.types.date")}
                              {field.type === "boolean" && t("inventory.detail.fields.types.boolean")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
                      {["string", "text", "integer", "date", "boolean"].map((type) => {
                        const count = (inventory.customFields as any[]).filter((f) => f.type === type).length;
                        const icon = {
                          string: "📝",
                          text: "📄",
                          integer: "🔢",
                          date: "📅",
                          boolean: "☑️",
                        }[type];

                        return (
                          <div key={type} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div className="text-2xl mb-1">{icon}</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">{count}/3</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{type}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⚙️</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("inventory.detail.fields.noFields")}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{t("inventory.detail.fields.noFieldsDesc")}</p>
                    <Link href={`/inventories/${inventory.id}/edit`} className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                      {t("inventory.detail.fields.addButton")}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "customid" && canEdit && (
              <div>
                {inventory.customIdFormat && (inventory.customIdFormat as any).enabled ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("custom_id_system") || "Custom ID Configuration"}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t("custom_id_subtitle") || "Item IDs will be automatically generated using this format"}</p>
                      </div>
                      <Link href={`/inventories/${inventory.id}/edit`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm">
                        {t("edit_format") || "Edit Format"}
                      </Link>
                    </div>

                    {/* ID Format Display */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column - Format Details */}
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("id_prefix") || "Prefix"}</div>
                          <div className="text-lg font-mono text-gray-900 dark:text-white">{(inventory.customIdFormat as any).prefix || <span className="text-gray-400 italic">{t("none") || "None"}</span>}</div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("counter") || "Counter"}</div>
                          <div className="text-lg font-mono text-gray-900 dark:text-white">
                            {t("start") || "Start"}: {(inventory.customIdFormat as any).counterStart} | {t("padding") || "Padding"}: {(inventory.customIdFormat as any).counterPadding}
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("id_suffix") || "Suffix"}</div>
                          <div className="text-lg font-mono text-gray-900 dark:text-white">{(inventory.customIdFormat as any).suffix || <span className="text-gray-400 italic">{t("none") || "None"}</span>}</div>
                        </div>
                      </div>

                      {/* Right Column - Preview */}
                      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{t("next_id_will_be") || "Next Item ID"}</h3>
                        <div className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-6 break-all">
                          {(() => {
                            const format = inventory.customIdFormat as any;
                            const counter = (format.currentCounter || format.counterStart).toString().padStart(format.counterPadding, "0");
                            return `${format.prefix}${counter}${format.suffix}`;
                          })()}
                        </div>

                        <div className="pt-4 border-t border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t("example_ids") || "Example IDs"}:</p>
                          <div className="flex flex-wrap gap-2">
                            {[0, 1, 2, 3, 4].map((i) => {
                              const format = inventory.customIdFormat as any;
                              const counter = ((format.currentCounter || format.counterStart) + i).toString().padStart(format.counterPadding, "0");
                              return (
                                <code key={i} className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-700 dark:text-gray-300">
                                  {`${format.prefix}${counter}${format.suffix}`}
                                </code>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{t("current_counter") || "Current Counter"}</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{(inventory.customIdFormat as any).currentCounter || (inventory.customIdFormat as any).counterStart}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-gray-400">{t("total_items") || "Total Items"}</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔢</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("custom_id_disabled") || "Custom ID Generation Disabled"}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{t("custom_id_disabled_desc") || "Enable custom ID generation to automatically create unique IDs for items"}</p>
                    <Link href={`/inventories/${inventory.id}/edit`} className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                      {t("configure_custom_id") || "Configure Custom ID"}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "access" && canEdit && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("access_settings") || "Access Settings"}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("access_settings_desc") || "Manage who can view and edit this inventory"}</p>
                </div>

                {/* Public/Private Toggle Info */}
                <div className={`p-4 rounded-lg border ${inventory.isPublic ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{inventory.isPublic ? "🌍" : "🔒"}</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {inventory.isPublic ? t("public_inventory") || "Public Inventory" : t("private_inventory") || "Private Inventory"}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {inventory.isPublic
                      ? t("public_inventory_desc") || "This inventory is public. All authenticated users have write access."
                      : t("private_inventory_desc") || "This inventory is private. Only you and selected users can access it."}
                  </p>
                  <Link href={`/inventories/${inventory.id}/edit`} className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    {t("change_visibility") || "Change visibility settings"} →
                  </Link>
                </div>

                {/* User Access Management - Only for Private Inventories */}
                {!inventory.isPublic && (
                  <>
                    {/* Search and Add Users */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("add_users") || "Add Users"}</h3>

                      {/* Search Input */}
                      <div className="relative">
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder={t("search_users") || "Search users by name or email..."}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                        {searching && (
                          <div className="absolute right-3 top-3">
                            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          </div>
                        )}
                      </div>

                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 max-h-60 overflow-y-auto">
                          {searchResults.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => addAllowedUser(user)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left"
                            >
                              <div className="relative w-10 h-10 flex-shrink-0">
                                {user.image ? (
                                  <Image src={user.image} alt={user.name || "User"} fill className="rounded-full object-cover" sizes="40px" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold">
                                    {(user.name || user.email)?.[0]?.toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white">{user.name || user.email}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                              </div>
                              <span className="text-blue-600 dark:text-blue-400">+</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {userSearch.trim().length >= 2 && !searching && searchResults.length === 0 && (
                        <div className="mt-2 p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                          {t("no_users_found") || "No users found"}
                        </div>
                      )}
                    </div>

                    {/* Current Allowed Users List */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {t("allowed_users") || "Allowed Users"} ({allowedUsersList.length})
                      </h3>

                      {allowedUsersList.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          {t("no_users_added") || "No users have been granted access yet"}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {allowedUsersList.map((user) => (
                            <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="relative w-10 h-10 flex-shrink-0">
                                {user.image ? (
                                  <Image src={user.image} alt={user.name || "User"} fill className="rounded-full object-cover" sizes="40px" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold">
                                    {(user.name || user.email)?.[0]?.toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white">{user.name || user.email}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                              </div>
                              <button
                                onClick={() => removeAllowedUser(user.id)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                title={t("remove_user") || "Remove user"}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={saveAccessSettings}
                        disabled={savingAccess}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingAccess ? t("saving") || "Saving..." : t("save_changes") || "Save Changes"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
