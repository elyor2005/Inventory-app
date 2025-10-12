"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useLanguage } from "../providers/LanguageProvider";
import { useEffect, useState } from "react";

export default function Navigation() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

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
    <nav className="hidden md:flex items-center gap-6">
      {navItems.map((item) => {
        if (item.authRequired && !session) return null;

        return (
          <Link key={item.href} href={item.href} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
            {item.label}
          </Link>
        );
      })}

      {/* Create Inventory Button */}
      {session && (
        <Link href="/inventories/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm">
          + New Inventory
        </Link>
      )}

      {/* Admin Link */}
      {isAdmin && (
        <Link href="/admin" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors">
          {t("nav.admin")}
        </Link>
      )}
    </nav>
  );
}
