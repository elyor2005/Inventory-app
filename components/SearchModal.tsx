"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import SearchBar from "./SearchBar";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus search input when modal opens
    if (isOpen && searchRef.current) {
      const input = searchRef.current.querySelector("input");
      input?.focus();
    }

    // Close on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/60 z-50 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-3 sm:px-4">
        <div
          className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-2xl animate-in slide-in-from-top-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Content */}
          <div ref={searchRef} className="p-4">
            <SearchBar />
          </div>

          {/* Footer hint */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 rounded-b-lg">
            <span>
              Press{" "}
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded text-xs font-mono">
                ESC
              </kbd>{" "}
              to close
            </span>
            <span className="hidden sm:inline">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded text-xs font-mono">
                ⌘K
              </kbd>{" "}
              to open
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
