"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface CommentFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  showCancel?: boolean;
  minHeight?: string;
}

export default function CommentForm({
  value,
  onChange,
  onSubmit,
  placeholder,
  submitLabel,
  cancelLabel,
  onCancel,
  isSubmitting = false,
  showCancel = false,
  minHeight = "min-h-[120px]",
}: CommentFormProps) {
  const { t } = useLanguage();
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            !showPreview
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {t("write") || "Write"}
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            showPreview
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {t("preview") || "Preview"}
        </button>
      </div>

      {/* Content Area */}
      {showPreview ? (
        <div className={`${minHeight} p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 overflow-auto`}>
          {value.trim() ? (
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 italic">{t("nothing_to_preview") || "Nothing to preview"}</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t("write_comment_markdown") || "Write your comment... (Markdown supported)"}
          className={`w-full ${minHeight} px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none`}
          disabled={isSubmitting}
        />
      )}

      {/* Hint Text */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("markdown_supported") || "Markdown supported"} • {t("ctrl_enter_to_submit") || "Ctrl+Enter to submit"}
        </p>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {value.length} {t("characters") || "characters"}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg transition"
          >
            {cancelLabel || t("common.cancel") || "Cancel"}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !value.trim()}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition"
        >
          {isSubmitting ? (t("posting") || "Posting...") : (submitLabel || t("post_comment") || "Post Comment")}
        </button>
      </div>
    </form>
  );
}
