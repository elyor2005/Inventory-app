"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";
import ItemForm from "@/components/ItemForm";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useToast } from "@/components/providers/ToastProvider";
import Link from "next/link";
import { CustomFieldDefinition } from "@/components/CustomFieldsBuilder";

interface CustomIdFormat {
  enabled: boolean;
  prefix: string;
  suffix: string;
  counterStart: number;
  counterPadding: number;
  currentCounter?: number;
}

interface Inventory {
  id: string;
  title: string;
  customFields: CustomFieldDefinition[];
  customIdFormat: CustomIdFormat;
  isPublic: boolean;
  creator: {
    id: string;
  };
}

export default function NewItemPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | number | boolean>>({});
  const [formData, setFormData] = useState({
    name: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [generatedId, setGeneratedId] = useState<string>("");

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inventories/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory);

        // Generate preview ID if custom ID is enabled
        if (data.inventory.customIdFormat?.enabled) {
          const format = data.inventory.customIdFormat;
          const counterValue = format.currentCounter ?? format.counterStart ?? 1;
          const counter = counterValue.toString().padStart(format.counterPadding || 3, "0");
          setGeneratedId(`${format.prefix || ""}${counter}${format.suffix || ""}`);
        }
      } else {
        router.push("/inventories");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      router.push("/inventories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required custom fields
    if (inventory?.customFields) {
      const requiredFields = inventory.customFields.filter((f) => f.required);
      const missingFields = requiredFields.filter((f) => !customFieldValues[f.name] || customFieldValues[f.name] === "");

      if (missingFields.length > 0) {
        showToast(`${t("error_required_fields") || "Please fill in all required fields"}: ${missingFields.map((f) => f.label).join(", ")}`, "error");
        return;
      }
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/inventories/${params.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          tags: formData.tags,
          customFieldValues: customFieldValues,
        }),
      });

      if (response.ok) {
        await response.json();
        router.push(`/inventories/${params.id}`);
        router.refresh();
      } else {
        const error = await response.json();
        showToast(error.error || t("error_create_item") || "Failed to create item", "error");
      }
    } catch (error) {
      console.error("Error creating item:", error);
      showToast(t("error_create_item") || "Failed to create item", "error");
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
        <Header />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!inventory || !session) {
    return null;
  }

  const isOwner = session.user.id === inventory.creator.id;
  const isAdmin = (session.user as { role?: string })?.role === "admin";
  const canAdd = isOwner || isAdmin || inventory.isPublic;

  if (!canAdd) {
    router.push(`/inventories/${params.id}`);
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <Link href="/inventories" className="hover:text-blue-600 dark:hover:text-blue-400">
              {t("my_inventories") || "My Inventories"}
            </Link>
            <span>→</span>
            <Link href={`/inventories/${inventory.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {inventory.title}
            </Link>
            <span>→</span>
            <span>{t("add_item") || "Add Item"}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("create_item") || "Create New Item"}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t("create_item_subtitle") || `Add a new item to ${inventory.title}`}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("item_information") || "Item Information"}</h2>

              {/* Generated ID Preview */}
              {generatedId && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("item_id") || "Item ID"}</div>
                  <div className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400">{generatedId}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("auto_generated") || "This ID will be automatically generated"}</p>
                </div>
              )}

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">{t("item_name") || "Item Name"} *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder={t("item_name_placeholder") || "e.g., Laptop, Book, Equipment"} />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t("item_tags") || "Tags"} <span className="text-gray-500 text-xs">({t("optional") || "optional"})</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder={t("add_tag_placeholder") || "Add a tag and press Enter"}
                  />
                  <button type="button" onClick={addTag} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition">
                    {t("add") || "Add"}
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600 dark:hover:text-red-400">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Fields */}
            {inventory.customFields && inventory.customFields.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t("custom_field_values") || "Custom Field Values"}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t("fill_custom_fields") || "Fill in the custom fields for this item"}</p>
                <ItemForm customFields={inventory.customFields} onValuesChange={setCustomFieldValues} />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 sticky bottom-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition">
                {t("cancel") || "Cancel"}
              </button>
              <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition">
                {saving ? t("creating_item") || "Creating..." : t("create_item") || "Create Item"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
