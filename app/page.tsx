"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import Image from "next/image";
import TagCloud from "@/components/TagCloud";
import { TableSkeleton } from "@/components/LoadingSkeleton";

interface Inventory {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string | null;
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

interface Tag {
  tag: string;
  count: number;
}

export default function Home() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [latestInventories, setLatestInventories] = useState<Inventory[]>([]);
  const [popularInventories, setPopularInventories] = useState<Inventory[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [latestRes, popularRes, tagsRes] = await Promise.all([fetch("/api/home/latest"), fetch("/api/home/popular"), fetch("/api/home/tags")]);

      const [latestData, popularData, tagsData] = await Promise.all([latestRes.json(), popularRes.json(), tagsRes.json()]);

      setLatestInventories(latestData.inventories || []);
      setPopularInventories(popularData.inventories || []);
      setTags(tagsData.tags || []);
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">{t("home.title")}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">{t("home.subtitle")}</p>

            {!session ? (
              <div className="flex gap-4 justify-center">
                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl">{t("homepage.getStarted")}</button>
                <Link href="/explore" className="px-8 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-lg transition">
                  {t("homepage.exploreInventories")}
                </Link>
              </div>
            ) : (
              <Link href="/inventories" className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl">
                {t("homepage.goToMyInventories")} →
              </Link>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">{t("homepage.featuresTitle")}</h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("homepage.features.customFields.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t("homepage.features.customFields.description")}</p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("homepage.features.accessControl.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t("homepage.features.accessControl.description")}</p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("homepage.features.smartTags.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t("homepage.features.smartTags.description")}</p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("homepage.features.customIds.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t("homepage.features.customIds.description")}</p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("homepage.features.collaboration.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t("homepage.features.collaboration.description")}</p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("homepage.features.statistics.title")}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t("homepage.features.statistics.description")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Inventories Table */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">{t("homepage.latestInventories") || "Latest Inventories"}</h2>

            {loading ? (
              <TableSkeleton rows={5} />
            ) : latestInventories.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">{t("no_inventories") || "No public inventories available"}</div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("inventory_name") || "Name"}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("description") || "Description"}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("creator") || "Creator"}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("category") || "Category"}</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("items") || "Items"}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {latestInventories.map((inventory) => (
                      <tr key={inventory.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/inventories/${inventory.id}`} className="flex items-center gap-3">
                            {inventory.image && (
                              <div className="relative w-12 h-12 flex-shrink-0">
                                <Image src={inventory.image} alt={inventory.title} fill className="rounded object-cover" sizes="48px" />
                              </div>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition">{inventory.title}</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{inventory.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {inventory.creator.image && (
                              <div className="relative w-6 h-6 flex-shrink-0">
                                <Image src={inventory.creator.image} alt={inventory.creator.name || "User"} fill className="rounded-full object-cover" sizes="24px" />
                              </div>
                            )}
                            <span className="text-sm text-gray-700 dark:text-gray-300">{inventory.creator.name || inventory.creator.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full">{t(`categories.${inventory.category.toLowerCase()}`) || inventory.category}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{inventory._count.items}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Top 5 Popular Inventories */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">{t("homepage.popularInventories") || "Top 5 Most Popular Inventories"}</h2>

            {loading ? (
              <TableSkeleton rows={5} />
            ) : popularInventories.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">{t("no_inventories") || "No inventories available"}</div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("rank") || "Rank"}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("inventory_name") || "Name"}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("description") || "Description"}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("creator") || "Creator"}</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("item_count") || "Item Count"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {popularInventories.map((inventory, index) => (
                      <tr key={inventory.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold">{index + 1}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/inventories/${inventory.id}`} className="flex items-center gap-3">
                            {inventory.image && (
                              <div className="relative w-12 h-12 flex-shrink-0">
                                <Image src={inventory.image} alt={inventory.title} fill className="rounded object-cover" sizes="48px" />
                              </div>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition">{inventory.title}</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{inventory.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {inventory.creator.image && (
                              <div className="relative w-6 h-6 flex-shrink-0">
                                <Image src={inventory.creator.image} alt={inventory.creator.name || "User"} fill className="rounded-full object-cover" sizes="24px" />
                              </div>
                            )}
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{inventory.creator.name || inventory.creator.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{inventory._count.items}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Tag Cloud */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">{t("homepage.tagCloud") || "Explore by Tags"}</h2>

            {loading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">{t("loading") || "Loading tags..."}</div>
            ) : (
              <div className="max-w-5xl mx-auto bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
                <TagCloud tags={tags} />
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        {!session && (
          <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t("homepage.cta.title")}</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">{t("homepage.cta.subtitle")}</p>
              <button className="px-8 py-3 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl">{t("homepage.cta.button")}</button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
