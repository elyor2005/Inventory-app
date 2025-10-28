"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Tag {
  tag: string;
  count: number;
}

interface TagCloudProps {
  tags: Tag[];
}

export default function TagCloud({ tags }: TagCloudProps) {
  const { t } = useLanguage();

  if (tags.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {t("no_tags") || "No tags available"}
      </div>
    );
  }

  // Calculate font sizes based on count
  const maxCount = Math.max(...tags.map((t) => t.count));
  const minCount = Math.min(...tags.map((t) => t.count));

  const getFontSize = (count: number) => {
    if (maxCount === minCount) return "text-base";
    const ratio = (count - minCount) / (maxCount - minCount);
    if (ratio > 0.8) return "text-2xl";
    if (ratio > 0.6) return "text-xl";
    if (ratio > 0.4) return "text-lg";
    if (ratio > 0.2) return "text-base";
    return "text-sm";
  };

  const getColor = (count: number) => {
    if (maxCount === minCount) return "text-blue-600 dark:text-blue-400";
    const ratio = (count - minCount) / (maxCount - minCount);
    if (ratio > 0.8) return "text-blue-700 dark:text-blue-300";
    if (ratio > 0.6) return "text-blue-600 dark:text-blue-400";
    if (ratio > 0.4) return "text-blue-500 dark:text-blue-500";
    if (ratio > 0.2) return "text-blue-400 dark:text-blue-600";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center items-center">
      {tags.map(({ tag, count }) => (
        <Link
          key={tag}
          href={`/search?q=${encodeURIComponent(tag)}`}
          className={`${getFontSize(count)} ${getColor(count)} hover:underline hover:opacity-80 transition-all font-medium`}
          title={`${count} ${count === 1 ? "inventory" : "inventories"}`}
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
