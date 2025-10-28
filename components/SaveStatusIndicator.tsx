"use client";

import { SaveStatus } from "@/hooks/useAutoSave";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

export default function SaveStatusIndicator({ status, lastSaved, hasUnsavedChanges }: SaveStatusIndicatorProps) {
  const { t } = useLanguage();

  const getStatusDisplay = () => {
    switch (status) {
      case "saving":
        return {
          icon: (
            <svg className="animate-spin h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ),
          text: t("autosave.saving") || "Saving...",
          color: "text-blue-600 dark:text-blue-400",
        };
      case "saved":
        return {
          icon: (
            <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          text: t("autosave.saved") || "Saved",
          color: "text-green-600 dark:text-green-400",
        };
      case "error":
        return {
          icon: (
            <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          text: t("autosave.save_error") || "Save failed",
          color: "text-red-600 dark:text-red-400",
        };
      case "conflict":
        return {
          icon: (
            <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          text: t("autosave.save_conflict") || "Conflict detected",
          color: "text-orange-600 dark:text-orange-400",
        };
      default:
        if (hasUnsavedChanges) {
          return {
            icon: (
              <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
              </svg>
            ),
            text: t("autosave.unsaved_changes") || "Unsaved changes",
            color: "text-gray-500 dark:text-gray-400",
          };
        }
        return null;
    }
  };

  const display = getStatusDisplay();

  if (!display) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {display.icon}
      <span className={`text-sm font-medium ${display.color}`}>{display.text}</span>
      {lastSaved && status === "saved" && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
          {t("autosave.at") || "at"} {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
