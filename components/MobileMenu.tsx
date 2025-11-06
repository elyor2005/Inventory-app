"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useLanguage } from "./providers/LanguageProvider";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import LoginButton from "./auth/LoginButton";
import { Menu, X, Package, Compass, Plus, Shield, Settings } from "lucide-react";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: session } = useSession();
  const { t } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    if (session?.user?.id) {
      checkAdminStatus();
    }
  }, [session]);

  useEffect(() => {
    // Close menu on route change
    setIsOpen(false);
  }, [pathname]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.user.role === "admin");
      }
    } catch (error) {
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
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 active:scale-95"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/60 z-40 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Menu Panel */}
      <div
        className={`
          absolute top-14 sm:top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-2xl z-50
          transition-all duration-300 ease-out max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto
          ${isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}
        `}
      >
        <nav className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-1.5">
          {/* Navigation Links */}
          {navItems.map((item) => {
            if (item.authRequired && !session) return null;
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 active:scale-95
                  ${
                    active
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* New Inventory Button */}
          {session && (
            <Link
              href="/inventories/new"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md active:scale-95 mt-2"
            >
              <Plus className="w-5 h-5" />
              <span>{t("navigation.newInventory")}</span>
            </Link>
          )}

          {/* Admin Link */}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 border active:scale-95 mt-1
                ${
                  pathname.startsWith("/admin")
                    ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                    : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                }
              `}
            >
              <Shield className="w-5 h-5" />
              <span>{t("nav.admin")}</span>
            </Link>
          )}

          {/* Divider */}
          <div className="border-t dark:border-gray-800 my-3"></div>

          {/* Settings Section */}
          <div className="flex flex-col gap-3 px-2">
            {/* Language & Theme Row */}
            <div className="flex items-center justify-between px-2 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">{t("common.settings")}</span>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>

            {/* Login Button */}
            <div className="w-full">
              <LoginButton />
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
