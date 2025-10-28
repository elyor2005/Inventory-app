"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type IdElementType =
  | "text"           // Fixed text
  | "sequence"       // Sequential number
  | "random6"        // 6-digit random
  | "random9"        // 9-digit random
  | "random20bit"    // 20-bit random (0-1048575)
  | "random32bit"    // 32-bit random (0-4294967295)
  | "guid"           // GUID
  | "datetime";      // Date/time

export interface IdElement {
  id: string;
  type: IdElementType;
  value?: string;      // For text type
  padding?: number;    // For sequence type
  format?: string;     // For datetime type (e.g., "YYYY-MM-DD", "YYYYMMDD", "HHmmss")
}

export interface CustomIdFormat {
  enabled: boolean;
  elements: IdElement[];
  separator?: string;  // Separator between elements (default: none)
  sequenceCounter?: number; // Current value of sequence counter
}

interface CustomIdBuilderProps {
  format: CustomIdFormat;
  onChange: (format: CustomIdFormat) => void;
}

function SortableElement({ element, onUpdate, onRemove }: {
  element: IdElement;
  onUpdate: (updates: Partial<IdElement>) => void;
  onRemove: () => void;
}) {
  const { t } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getElementLabel = () => {
    switch (element.type) {
      case "text": return t("custom_id.text") || "Fixed Text";
      case "sequence": return t("custom_id.sequence") || "Sequence";
      case "random6": return t("custom_id.random6") || "6-Digit Random";
      case "random9": return t("custom_id.random9") || "9-Digit Random";
      case "random20bit": return t("custom_id.random20bit") || "20-bit Random";
      case "random32bit": return t("custom_id.random32bit") || "32-bit Random";
      case "guid": return t("custom_id.guid") || "GUID";
      case "datetime": return t("custom_id.datetime") || "Date/Time";
      default: return element.type;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-2"
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          title={t("drag_to_reorder")}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
          </svg>
        </button>

        {/* Element Configuration */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{getElementLabel()}</span>
            <button
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
              title={t("remove_element")}
            >
              ✕
            </button>
          </div>

          {/* Type-specific configuration */}
          {element.type === "text" && (
            <input
              type="text"
              value={element.value || ""}
              onChange={(e) => onUpdate({ value: e.target.value })}
              placeholder={t("enter_text")}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          )}

          {element.type === "sequence" && (
            <select
              value={element.padding || 1}
              onChange={(e) => onUpdate({ padding: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">{t("no_padding")}</option>
              <option value="2">{t("padding_2_digits")}</option>
              <option value="3">{t("padding_3_digits")}</option>
              <option value="4">{t("padding_4_digits")}</option>
              <option value="5">{t("padding_5_digits")}</option>
              <option value="6">{t("padding_6_digits")}</option>
            </select>
          )}

          {element.type === "datetime" && (
            <select
              value={element.format || "YYYY-MM-DD"}
              onChange={(e) => onUpdate({ format: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="YYYY-MM-DD">2025-01-27</option>
              <option value="YYYYMMDD">20250127</option>
              <option value="YYYY-MM">2025-01</option>
              <option value="YYYYMM">202501</option>
              <option value="YYYY">2025</option>
              <option value="HHmmss">143052</option>
              <option value="HH:mm:ss">14:30:52</option>
            </select>
          )}

          {(element.type === "random6" || element.type === "random9" ||
            element.type === "random20bit" || element.type === "random32bit" ||
            element.type === "guid") && (
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
              {t("generated_automatically")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomIdBuilder({ format, onChange }: CustomIdBuilderProps) {
  const { t } = useLanguage();
  const [localFormat, setLocalFormat] = useState<CustomIdFormat>(format);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setLocalFormat(format);
  }, [format]);

  const updateFormat = (updates: Partial<CustomIdFormat>) => {
    const newFormat = { ...localFormat, ...updates };
    setLocalFormat(newFormat);
    onChange(newFormat);
  };

  const addElement = (type: IdElementType) => {
    const newElement: IdElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      ...(type === "text" && { value: "" }),
      ...(type === "sequence" && { padding: 3 }),
      ...(type === "datetime" && { format: "YYYY-MM-DD" }),
    };

    updateFormat({
      elements: [...localFormat.elements, newElement],
    });
    setShowAddMenu(false);
  };

  const updateElement = (id: string, updates: Partial<IdElement>) => {
    updateFormat({
      elements: localFormat.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    });
  };

  const removeElement = (id: string) => {
    updateFormat({
      elements: localFormat.elements.filter((el) => el.id !== id),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localFormat.elements.findIndex((el) => el.id === active.id);
      const newIndex = localFormat.elements.findIndex((el) => el.id === over.id);

      updateFormat({
        elements: arrayMove(localFormat.elements, oldIndex, newIndex),
      });
    }
  };

  const generatePreviewId = () => {
    if (!localFormat.enabled || localFormat.elements.length === 0) {
      return t("custom_id_disabled") || "Custom ID disabled";
    }

    const parts = localFormat.elements.map((element) => {
      switch (element.type) {
        case "text":
          return element.value || "[text]";
        case "sequence":
          const counter = localFormat.sequenceCounter || 1;
          return counter.toString().padStart(element.padding || 1, "0");
        case "random6":
          return "123456";
        case "random9":
          return "123456789";
        case "random20bit":
          return "A3F89B";
        case "random32bit":
          return "7C9E2F4A";
        case "guid":
          return "a1b2c3d4-e5f6";
        case "datetime":
          const now = new Date();
          return formatDateTime(now, element.format || "YYYY-MM-DD");
        default:
          return "";
      }
    });

    return parts.join(localFormat.separator || "");
  };

  const formatDateTime = (date: Date, format: string): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return format
      .replace("YYYY", String(year))
      .replace("MM", month)
      .replace("DD", day)
      .replace("HH", hours)
      .replace("mm", minutes)
      .replace("ss", seconds);
  };

  const elementTypes: { type: IdElementType; label: string; description: string }[] = [
    { type: "text", label: t("custom_id.text") || "Fixed Text", description: "Add custom text" },
    { type: "sequence", label: t("custom_id.sequence") || "Sequence", description: "Auto-incrementing number" },
    { type: "datetime", label: t("custom_id.datetime") || "Date/Time", description: "Current date/time" },
    { type: "random6", label: t("custom_id.random6") || "6-Digit Random", description: "000000-999999" },
    { type: "random9", label: t("custom_id.random9") || "9-Digit Random", description: "000000000-999999999" },
    { type: "random20bit", label: t("custom_id.random20bit") || "20-bit Random", description: "Hex: 00000-FFFFF" },
    { type: "random32bit", label: t("custom_id.random32bit") || "32-bit Random", description: "Hex: 00000000-FFFFFFFF" },
    { type: "guid", label: t("custom_id.guid") || "GUID", description: "Unique identifier" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          {t("custom_id_system") || "Custom ID System"}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("custom_id_description") || "Build custom item IDs by combining multiple elements"}
        </p>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localFormat.enabled}
              onChange={(e) => updateFormat({ enabled: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white block">
                {localFormat.enabled
                  ? t("custom_id_enabled") || "Custom ID generation is enabled"
                  : t("custom_id_disabled") || "Custom ID generation is disabled"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {localFormat.enabled
                  ? t("id_format_help") || "Configure ID elements below"
                  : t("enable_custom_id") || "Enable to configure custom ID format"}
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* ID Builder (only shown when enabled) */}
      {localFormat.enabled && (
        <div className="space-y-4">
          {/* Separator Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("id_separator") || "Separator between elements"} <span className="text-gray-500 text-xs">({t("optional") || "optional"})</span>
            </label>
            <input
              type="text"
              value={localFormat.separator || ""}
              onChange={(e) => updateFormat({ separator: e.target.value })}
              placeholder="e.g., - or _ or leave empty"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              maxLength={3}
            />
          </div>

          {/* Elements List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("id_elements") || "ID Elements"} ({localFormat.elements.length}/10)
              </label>
            </div>

            {localFormat.elements.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("no_elements") || "No elements added yet. Click 'Add Element' to start building your ID format."}
                </p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={localFormat.elements.map((el) => el.id)} strategy={verticalListSortingStrategy}>
                  {localFormat.elements.map((element) => (
                    <SortableElement
                      key={element.id}
                      element={element}
                      onUpdate={(updates) => updateElement(element.id, updates)}
                      onRemove={() => removeElement(element.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Add Element Button */}
          {localFormat.elements.length < 10 && (
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <span>+</span>
                <span>{t("add_element") || "Add Element"}</span>
              </button>

              {/* Add Element Menu */}
              {showAddMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
                  {elementTypes.map((elementType) => (
                    <button
                      key={elementType.type}
                      onClick={() => addElement(elementType.type)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{elementType.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{elementType.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t("id_preview") || "ID Preview"}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {t("example_id") || "Example ID"}:
                </span>
                <code className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono text-blue-600 dark:text-blue-400">
                  {generatePreviewId()}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
