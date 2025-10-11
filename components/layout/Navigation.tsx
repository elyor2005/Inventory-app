"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useLanguage } from "../providers/LanguageProvider";

export default function Navigation() {
  const { data: session } = useSession();
  const { t } = useLanguage();

  const navItems = [
    { href: "/", label: t("nav.home"), authRequired: false },
    { href: "/inventories", label: t("nav.myInventories"), authRequired: true },
    { href: "/explore", label: t("nav.explore"), authRequired: false },
  ];

  const isAdmin = session?.user?.role === "admin";

  return (
    <nav className="hidden md:flex items-center gap-6">
      {navItems.map((item) => {
        // Hide auth-required items if not logged in
        if (item.authRequired && !session) return null;

        return (
          <Link key={item.href} href={item.href} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
            {item.label}
          </Link>
        );
      })}

      {isAdmin && (
        <Link href="/admin" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors">
          {t("nav.admin")}
        </Link>
      )}
    </nav>
  );
}
