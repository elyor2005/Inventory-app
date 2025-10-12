"use client";

import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function ExplorePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Explore Public Inventories</h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">This page will show all public inventories from all users.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Coming soon in Phase 8-10 when we build the public inventory features!</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
