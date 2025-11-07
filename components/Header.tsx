"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import LoginButton from "./auth/LoginButton";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";
import { useLanguage } from "./providers/LanguageProvider";
import SearchModal from "./SearchModal";
import { Package, Compass, Plus, Shield, Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      checkAdminStatus();
    }
  }, [session]);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.user.role === "admin");
      }
    } catch {
      // Silent fail
    }
  };

  const navItems = [
    { href: "/inventories", label: t("nav.myInventories"), authRequired: true, icon: Package },
    { href: "/explore", label: t("nav.explore"), authRequired: false, icon: Compass },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex h-16 lg:h-[4.5rem] items-center gap-2 sm:gap-3 lg:gap-4">
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <MobileMenu />
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg sm:text-xl">I</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">{t("common.appName")}</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.authRequired && !session) return null;
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm
                    ${active ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Create Inventory Button */}
            {session && (
              <Link href="/inventories/new" className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                <Plus className="w-4 h-4" />
                <span className="hidden xl:inline">{t("navigation.newInventory")}</span>
              </Link>
            )}

            {/* Admin Link */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`
                  hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm
                  ${pathname.startsWith("/admin") ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"}
                `}
              >
                <Shield className="w-4 h-4" />
                <span className="hidden xl:inline">{t("nav.admin")}</span>
              </Link>
            )}

            {/* Language Switcher */}
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
            {/* Search Button */}
            <button onClick={() => setShowSearch(true)} className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all active:scale-95" aria-label="Open search (⌘K)" title="Search (⌘K)">
              <Search className="w-5 h-5" />
            </button>

            {/* Login Button */}
            <div className="hidden lg:block">
              <LoginButton />
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal (Mobile/Tablet) */}
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </header>
  );
}
