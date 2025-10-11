"use client";

import { useLanguage } from "./providers/LanguageProvider";
import { locales, localeNames } from "@/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex gap-2 items-center">
      {locales.map((loc) => (
        <button key={loc} onClick={() => setLocale(loc)} className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${locale === loc ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"}`}>
          {localeNames[loc]}
        </button>
      ))}
    </div>
  );
}
