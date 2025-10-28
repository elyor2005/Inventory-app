"use client";

import { useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { CustomFieldDefinition } from "@/components/CustomFieldsBuilder";

interface ItemFormProps {
  customFields: CustomFieldDefinition[];
  onValuesChange: (values: Record<string, string | number | boolean>) => void;
  initialValues?: Record<string, string | number | boolean>;
}

export default function ItemForm({ customFields, onValuesChange, initialValues = {} }: ItemFormProps) {
  const { t } = useLanguage();
  const [values, setValues] = useState<Record<string, string | number | boolean>>(initialValues);

  const handleChange = (fieldName: string, value: string | number | boolean) => {
    const newValues = { ...values, [fieldName]: value };
    setValues(newValues);
    onValuesChange(newValues);
  };

  if (!customFields || customFields.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <p className="text-sm">{t("no_custom_fields")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customFields.map((field, index) => (
        <div key={index}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {/* String Field */}
          {field.type === "string" && <input type="text" value={String(values[field.name] || "")} onChange={(e) => handleChange(field.name, e.target.value)} required={field.required} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t("enter_field").replace("{field}", field.label.toLowerCase())} />}

          {/* Text Field */}
          {field.type === "text" && <textarea value={String(values[field.name] || "")} onChange={(e) => handleChange(field.name, e.target.value)} required={field.required} rows={4} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t("enter_field").replace("{field}", field.label.toLowerCase())} />}

          {/* Integer Field */}
          {field.type === "integer" && <input type="number" value={values[field.name] !== undefined ? Number(values[field.name]) : ""} onChange={(e) => handleChange(field.name, e.target.value ? parseInt(e.target.value) : 0)} required={field.required} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t("enter_field").replace("{field}", field.label.toLowerCase())} />}

          {/* Date Field */}
          {field.type === "date" && <input type="date" value={String(values[field.name] || "")} onChange={(e) => handleChange(field.name, e.target.value)} required={field.required} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />}

          {/* Boolean Field */}
          {field.type === "boolean" && (
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={Boolean(values[field.name])} onChange={(e) => handleChange(field.name, e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{field.label}</span>
            </div>
          )}

          {/* Field Description */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {field.type === "string" && t("field_string_desc")}
            {field.type === "text" && t("field_text_desc")}
            {field.type === "integer" && t("field_integer_desc")}
            {field.type === "date" && t("field_date_desc")}
            {field.type === "boolean" && t("field_boolean_desc")}
          </p>
        </div>
      ))}
    </div>
  );
}
