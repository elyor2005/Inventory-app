"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useLanguage } from "./providers/LanguageProvider";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import LoginButton from "./auth/LoginButton";
import { Menu, X } from "lucide-react";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: session } = useSession();
  const { t } = useLanguage();

  useEffect(() => {
    if (session?.user?.id) {
      checkAdminStatus();
    }
  }, [session]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.user.role === "admin");
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const navItems = [
    { href: "/", label: t("nav.home"), authRequired: false },
    { href: "/inventories", label: t("nav.myInventories"), authRequired: true },
    { href: "/explore", label: t("nav.explore"), authRequired: false },
  ];

  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" aria-label="Toggle menu">
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/25 dark:bg-black/50 z-40 animate-in fade-in duration-200" onClick={() => setIsOpen(false)} aria-hidden="true" />}

      {/* Menu Panel */}
      <div className={`absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-lg z-50 transition-all duration-300 ease-in-out ${isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}>
        <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
          {navItems.map((item) => {
            if (item.authRequired && !session) return null;

            return (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium">
                {item.label}
              </Link>
            );
          })}

          {/* New Inventory Button */}
          {session && (
            <Link href="/inventories/new" onClick={() => setIsOpen(false)} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-center">
              + {t("navigation.newInventory")}
            </Link>
          )}

          {/* Admin Link */}
          {isAdmin && (
            <Link href="/admin" onClick={() => setIsOpen(false)} className="px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium border border-red-300 dark:border-red-800 flex items-center gap-2">
              {t("nav.admin") || "Admin"}
            </Link>
          )}

          {/* Divider */}
          <div className="border-t dark:border-gray-800 my-2"></div>

          {/* Tools Section */}
          <div className="flex flex-col gap-3 px-4 py-2">
            {/* Language & Theme Row */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("common.settings") || "Settings"}</span>
              <div className="flex items-center gap-3">
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
