"use client";

import Header from "@/components/Header";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function Home() {
  const { t } = useLanguage();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">{t("home.title")}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">{t("home.subtitle")}</p>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-blue-200 dark:border-gray-500">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">✅ {t("home.phase3Title")}</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-200">
              <li>✅ {t("home.phase3Item1")}</li>
              <li>✅ {t("home.phase3Item2")}</li>
              <li>✅ {t("home.phase3Item3")}</li>
            </ul>
          </div>

          <div className="mt-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-xl border border-green-200 dark:border-green-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">✅ Phase 4: Theme & Language</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-200">
              <li>✅ Light/Dark theme toggle</li>
              <li>✅ English + Uzbek languages</li>
              <li>✅ Preferences saved</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
