"use client";

import Link from "next/link";
import LoginButton from "./auth/LoginButton";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import Navigation from "./layout/Navigation";
import MobileMenu from "./MobileMenu";
import { useLanguage } from "./providers/LanguageProvider";
import SearchBar from "./SearchBar";

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur">
      <div className="container mx-auto px-4">
        {/* Top row */}
        <div className="flex h-16 items-center justify-between gap-2">
          {/* Left: Mobile menu + Logo */}
          <div className="flex items-center gap-2">
            <MobileMenu />

            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hidden sm:block">{t("common.appName")}</h1>
            </Link>
          </div>

          {/* Center: Search (desktop only) */}
          <div className="hidden md:flex flex-1 justify-center max-w-md">
            <SearchBar />
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <ThemeToggle />
            <div className="hidden sm:block">
              <LoginButton />
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex h-12 items-center border-t dark:border-gray-800">
          <Navigation />
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
