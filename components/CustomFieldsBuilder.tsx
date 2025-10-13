"use client";

import { useLanguage } from "./providers/LanguageProvider";

export type FieldType = "string" | "text" | "integer" | "boolean" | "date";

export interface CustomFieldDefinition {
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
}

interface CustomFieldsManagerProps {
  fields: CustomFieldDefinition[];
  onChange: (fields: CustomFieldDefinition[]) => void;
}

const MAX_FIELDS_PER_TYPE = 3;

export default function CustomFieldsManager({ fields, onChange }: CustomFieldsManagerProps) {
  const { t } = useLanguage();
  // Count fields by type
  const getFieldCountByType = (type: FieldType) => {
    return fields.filter((f) => f.type === type).length;
  };

  const canAddField = (type: FieldType) => {
    return getFieldCountByType(type) < MAX_FIELDS_PER_TYPE;
  };

  const addField = (type: FieldType) => {
    if (!canAddField(type)) return;

    // Generate a unique field name based on type and count
    const count = getFieldCountByType(type);
    const fieldName = `${type}_field_${count + 1}`;

    const newField: CustomFieldDefinition = {
      name: fieldName,
      type,
      label: "",
      required: false,
    };

    onChange([...fields, newField]);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    onChange(newFields);
  };

  const updateField = (index: number, updates: Partial<CustomFieldDefinition>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    onChange(newFields);
  };

  const fieldTypes: { type: FieldType; label: string; icon: string }[] = [
    { type: "string", label: t("customFieldsBuilder.types.string"), icon: "📝" },
    { type: "text", label: t("customFieldsBuilder.types.text"), icon: "📄" },
    { type: "integer", label: t("customFieldsBuilder.types.integer"), icon: "🔢" },
    { type: "date", label: t("customFieldsBuilder.types.date"), icon: "📅" },
    { type: "boolean", label: t("customFieldsBuilder.types.boolean"), icon: "☑️" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t("customFieldsBuilder.title")}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t("customFieldsBuilder.description")}</p>
      </div>

      {/* Field Type Buttons */}
      <div className="flex flex-wrap gap-2">
        {fieldTypes.map(({ type, label, icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => addField(type)}
            disabled={!canAddField(type)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors
              ${canAddField(type) ? "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50" : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"}
            `}
          >
            <span>{icon}</span>
            <span>{label}</span>
            <span className="text-xs opacity-70">
              ({getFieldCountByType(type)}/{MAX_FIELDS_PER_TYPE})
            </span>
          </button>
        ))}
      </div>

      {/* Added Fields List */}
      {fields.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("customFieldsBuilder.addedFields")} ({fields.length})</h4>
          {fields.map((field, index) => {
            const fieldTypeInfo = fieldTypes.find((ft) => ft.type === field.type);
            return (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{fieldTypeInfo?.icon}</span>
                  <div className="flex-1 space-y-3">
                    {/* Field Label */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("customFieldsBuilder.fieldLabel")} *</label>
                      <input type="text" value={field.label} onChange={(e) => updateField(index, { label: e.target.value })} placeholder={t("customFieldsBuilder.fieldLabelPlaceholder")} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                    </div>

                    {/* Field Type (Display Only) */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t("customFieldsBuilder.fieldType")}: <span className="font-medium">{fieldTypeInfo?.label}</span>
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t("customFieldsBuilder.fieldName")}: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{field.name}</code>
                      </span>
                    </div>

                    {/* Required Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={field.required} onChange={(e) => updateField(index, { required: e.target.checked })} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t("customFieldsBuilder.requiredField")}</span>
                    </label>
                  </div>

                  {/* Remove Button */}
                  <button type="button" onClick={() => removeField(index)} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title={t("customFieldsBuilder.removeField")}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-sm">{t("customFieldsBuilder.noFieldsYet")}</p>
        </div>
      )}
    </div>
  );
}
