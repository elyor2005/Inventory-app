"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Link from "next/link";
import Image from "next/image";
import { ItemCardSkeleton } from "@/components/LoadingSkeleton";

interface Inventory {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string | null;
  tags: string[];
  creator: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  _count: {
    items: number;
  };
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ExplorePage() {
  const { t } = useLanguage();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const fetchInventories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (category !== "all") {
        params.append("category", category);
      }

      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/explore?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInventories(data.inventories);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching inventories:", error);
    } finally {
      setLoading(false);
    }
  }, [category, search, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchInventories();
  }, [fetchInventories]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPagination({ ...pagination, page: 1 });
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPagination({ ...pagination, page: 1 });
  };

  const categories = [
    { value: "all", label: t("all_categories") || "All Categories" },
    { value: "Equipment", label: t("categories.equipment") },
    { value: "Furniture", label: t("categories.furniture") },
    { value: "Books", label: t("categories.books") },
    { value: "Documents", label: t("categories.documents") },
    { value: "Electronics", label: t("categories.electronics") },
    { value: "Other", label: t("categories.other") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("explore.title") || "Explore Public Inventories"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("explore.description") || "Browse all public inventories from the community"}
            </p>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={t("search_placeholder") || "Search inventories..."}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                {t("search") || "Search"}
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    category === cat.value
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {t("showing_results")?.replace("{count}", pagination.total.toString()) ||
                `Showing ${pagination.total} results`}
            </div>
          )}

          {/* Inventories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          ) : inventories.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t("no_public_inventories") || "No Public Inventories Found"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {search || category !== "all"
                  ? t("no_results_desc") || "Try different keywords or adjust your filters"
                  : t("no_inventories") || "No public inventories available"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inventories.map((inventory) => (
                  <Link
                    key={inventory.id}
                    href={`/inventories/${inventory.id}`}
                    className="group bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                  >
                    {/* Image */}
                    {inventory.image ? (
                      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
                        <Image
                          src={inventory.image}
                          alt={inventory.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                        <span className="text-6xl">📦</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5">
                      {/* Title and Category */}
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-1">
                          {inventory.title}
                        </h3>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full">
                          {t(`categories.${inventory.category.toLowerCase()}`) || inventory.category}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {inventory.description}
                      </p>

                      {/* Tags */}
                      {inventory.tags && inventory.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {inventory.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {inventory.tags.length > 3 && (
                            <span className="px-2 py-0.5 text-gray-500 dark:text-gray-500 text-xs">
                              +{inventory.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        {/* Creator */}
                        <div className="flex items-center gap-2">
                          {inventory.creator.image ? (
                            <div className="relative w-6 h-6">
                              <Image
                                src={inventory.creator.image}
                                alt={inventory.creator.name || "User"}
                                fill
                                className="rounded-full object-cover"
                                sizes="24px"
                              />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 font-semibold">
                              {(inventory.creator.name || inventory.creator.email)?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                            {inventory.creator.name || inventory.creator.email}
                          </span>
                        </div>

                        {/* Item Count */}
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">{inventory._count.items}</span>
                          <span>{t("items") || "items"}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ← {t("previous") || "Previous"}
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first page, last page, current page, and pages around current
                        return (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.page - 1 && page <= pagination.page + 1)
                        );
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;

                        return (
                          <div key={page} className="flex items-center gap-2">
                            {showEllipsisBefore && (
                              <span className="text-gray-500 dark:text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => setPagination({ ...pagination, page })}
                              className={`w-10 h-10 rounded-lg font-medium transition ${
                                pagination.page === page
                                  ? "bg-blue-600 text-white"
                                  : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {t("next") || "Next"} →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
