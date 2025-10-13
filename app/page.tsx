"use client";

import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

export default function Home() {
  const { t } = useLanguage();
  const { data: session } = useSession();

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
