"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useLanguage } from "./providers/LanguageProvider";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const { t } = useLanguage();

  const navItems = [
    { href: "/", label: t("nav.home"), authRequired: false },
    { href: "/inventories", label: t("nav.myInventories"), authRequired: true },
    { href: "/explore", label: t("nav.explore"), authRequired: false },
  ];

  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" aria-label="Toggle menu">
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-lg z-50">
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
                + New Inventory
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
