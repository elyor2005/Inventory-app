"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-16">
        <div className="text-center px-4">
          {/* Error Illustration */}
          <div className="mb-8">
            <svg className="mx-auto h-64 w-64 text-red-400 dark:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Text */}
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">Oops!</h1>
          <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4">{t("something_went_wrong")}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">{t("error_page_message")}</p>

          {/* Error Details (dev mode) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-red-800 dark:text-red-400 font-mono">{error.message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button onClick={reset} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {t("try_again")}
            </button>
            <Link href="/" className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              {t("go_back_home")}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
