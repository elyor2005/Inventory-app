"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface SearchResult {
  type: "inventory" | "item";
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  inventoryId?: string;
  inventoryName?: string;
  createdAt?: string;
}

const CATEGORIES = ["Equipment", "Furniture", "Books", "Documents", "Electronics", "Other"];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState<"all" | "inventories" | "items">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, searchType, selectedCategory]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        ...(searchType !== "all" && { type: searchType }),
        ...(selectedCategory && { category: selectedCategory }),
      });

      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchType("all");
    setSelectedCategory("");
  };

  const inventoryResults = results.filter((r) => r.type === "inventory");
  const itemResults = results.filter((r) => r.type === "item");

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{(t("search_results_for") || 'Search results for "{query}"').replace("{query}", query)}</h1>
            <p className="text-gray-600 dark:text-gray-400">{loading ? (t("searching") || "Searching...") : (t("showing_results") || "Showing {count} results").replace("{count}", results.length.toString())}</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className="lg:w-64 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t("filters") || "Filters"}</h3>
                  {(searchType !== "all" || selectedCategory) && (
                    <button onClick={clearFilters} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      {t("clear_filters") || "Clear"}
                    </button>
                  )}
                </div>

                {/* Search Type Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("search_type") || "Search Type"}</label>
                  <select value={searchType} onChange={(e) => setSearchType(e.target.value as "all" | "inventories" | "items")} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                    <option value="all">{t("all_inventories") || "All"}</option>
                    <option value="inventories">{t("search_inventories") || "Inventories"}</option>
                    <option value="items">{t("search_items") || "Items"}</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("filter_by_category") || "Category"}</label>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                    <option value="">{t("all_categories") || "All Categories"}</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {t(`category_${cat.toLowerCase()}`) || cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t("results_summary") || "Results Summary"}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("search_inventories") || "Inventories"}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{inventoryResults.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("search_items") || "Items"}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{itemResults.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">{t("searching") || "Searching..."}</p>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("no_results") || "No results found"}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{t("no_results_desc") || "Try different keywords or adjust your filters"}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Inventories */}
                  {inventoryResults.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{(t("inventories_found") || "{count} inventories found").replace("{count}", inventoryResults.length.toString())}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {inventoryResults.map((result) => (
                          <Link key={result.id} href={`/inventories/${result.id}`} className="block p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition hover:shadow-md">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">📁</div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{result.name}</h3>
                                {result.description && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{result.description}</p>}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded">{result.category}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  {itemResults.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{(t("items_found") || "{count} items found").replace("{count}", itemResults.length.toString())}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {itemResults.map((result) => (
                          <Link key={result.id} href={`/inventories/${result.inventoryId}/items/${result.id}`} className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 transition hover:shadow-md">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xl">📦</div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{result.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{result.inventoryName}</p>
                                {result.tags && result.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {result.tags.slice(0, 3).map((tag) => (
                                      <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
