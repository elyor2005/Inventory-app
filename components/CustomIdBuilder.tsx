"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export interface CustomIdFormat {
  enabled: boolean;
  prefix: string;
  suffix: string;
  counterStart: number;
  counterPadding: number;
  currentCounter: number;
}

interface CustomIdBuilderProps {
  format: CustomIdFormat;
  onChange: (format: CustomIdFormat) => void;
}

export default function CustomIdBuilder({ format, onChange }: CustomIdBuilderProps) {
  const { t } = useLanguage();
  const [localFormat, setLocalFormat] = useState<CustomIdFormat>(format);

  useEffect(() => {
    setLocalFormat(format);
  }, [format]);

  const updateFormat = (updates: Partial<CustomIdFormat>) => {
    const newFormat = { ...localFormat, ...updates };
    setLocalFormat(newFormat);
    onChange(newFormat);
  };

  const generatePreviewId = (counter: number) => {
    if (!localFormat.enabled) return t("custom_id_disabled") || "Custom ID disabled";

    const paddedCounter = counter.toString().padStart(localFormat.counterPadding, "0");
    return `${localFormat.prefix}${paddedCounter}${localFormat.suffix}`;
  };

  const toggleEnabled = () => {
    updateFormat({ enabled: !localFormat.enabled });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t("custom_id_system") || "Custom ID System"}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t("custom_id_description", "Define how item IDs will be generated in this inventory")}</p>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={localFormat.enabled} onChange={toggleEnabled} className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white block">{localFormat.enabled ? t("custom_id_enabled", "Custom ID generation is enabled") : t("custom_id_disabled", "Custom ID generation is disabled")}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{localFormat.enabled ? t("id_format_help", "Define how item IDs will look") : t("enable_custom_id", "Enable to configure custom ID format")}</span>
            </div>
          </label>
        </div>
      </div>

      {/* ID Format Configuration (only shown when enabled) */}
      {localFormat.enabled && (
        <div className="space-y-4 p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          {/* Prefix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("id_prefix", "Prefix")} <span className="text-gray-500 text-xs">({t("optional", "optional")})</span>
            </label>
            <input type="text" value={localFormat.prefix} onChange={(e) => updateFormat({ prefix: e.target.value })} placeholder="e.g., BOOK-, EQ-2024-" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("prefix_help", "Optional text before the counter")}</p>
          </div>

          {/* Counter Start */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("id_counter_start", "Counter Start")}</label>
            <input type="number" min="1" value={localFormat.counterStart} onChange={(e) => updateFormat({ counterStart: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("counter_start_help", "Starting number for the counter (default: 1)")}</p>
          </div>

          {/* Counter Padding */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("id_counter_padding", "Counter Padding")}</label>
            <select value={localFormat.counterPadding} onChange={(e) => updateFormat({ counterPadding: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="1">1 (1, 2, 3...)</option>
              <option value="2">2 (01, 02, 03...)</option>
              <option value="3">3 (001, 002, 003...)</option>
              <option value="4">4 (0001, 0002, 0003...)</option>
              <option value="5">5 (00001, 00002, 00003...)</option>
              <option value="6">6 (000001, 000002, 000003...)</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("counter_padding_help", "Minimum digits for counter")}</p>
          </div>

          {/* Suffix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("id_suffix", "Suffix")} <span className="text-gray-500 text-xs">({t("optional", "optional")})</span>
            </label>
            <input type="text" value={localFormat.suffix} onChange={(e) => updateFormat({ suffix: e.target.value })} placeholder="e.g., -A, -ITEM" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("suffix_help", "Optional text after the counter")}</p>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t("id_preview", "ID Preview")}</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">{t("next_id_will_be", "Next item ID will be")}:</span>
                <code className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono text-blue-600 dark:text-blue-400">{generatePreviewId(localFormat.currentCounter || localFormat.counterStart)}</code>
              </div>

              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t("example_ids", "Example IDs")}:</p>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2].map((i) => (
                    <code key={i} className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-700 dark:text-gray-300">
                      {generatePreviewId((localFormat.currentCounter || localFormat.counterStart) + i)}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
