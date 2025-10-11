/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Locale, defaultLocale } from "@/i18n";

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLocale = defaultLocale }: { children: React.ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load saved language from localStorage
    const saved = localStorage.getItem("locale") as Locale;
    if (saved) {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    // Load messages for current locale
    import(`@/messages/${locale}.json`).then((m) => setMessages(m.default));
    // Save to localStorage
    localStorage.setItem("locale", locale);
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = messages;

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  return <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
