"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";
import ItemForm from "@/components/ItemForm";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { CustomFieldDefinition } from "@/components/CustomFieldsBuilder";

interface Item {
  id: string;
  name: string;
  tags: string[];
  stringValues: Record<string, string> | null;
  textValues: Record<string, string> | null;
  integerValues: Record<string, number> | null;
  dateValues: Record<string, string> | null;
  booleanValues: Record<string, boolean> | null;
}

interface Inventory {
  id: string;
  title: string;
  customFields: CustomFieldDefinition[];
  creator: {
    id: string;
  };
}

export default function EditItemPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | number | boolean>>({});
  const [formData, setFormData] = useState({
    name: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, params.itemId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch inventory
      const invResponse = await fetch(`/api/inventories/${params.id}`);
      if (invResponse.ok) {
        const invData = await invResponse.json();
        setInventory(invData.inventory);
      }

      // Fetch item
      const itemResponse = await fetch(`/api/inventories/${params.id}/items/${params.itemId}`);
      if (itemResponse.ok) {
        const itemData = await itemResponse.json();
        setItem(itemData.item);
        setFormData({
          name: itemData.item.name,
          tags: itemData.item.tags,
        });

        // Combine all custom field values
        const allValues: Record<string, string | number | boolean> = {
          ...(itemData.item.stringValues || {}),
          ...(itemData.item.textValues || {}),
          ...(itemData.item.integerValues || {}),
          ...(itemData.item.dateValues || {}),
          ...(itemData.item.booleanValues || {}),
        };
        setCustomFieldValues(allValues);
      } else {
        router.push(`/inventories/${params.id}`);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      router.push(`/inventories/${params.id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);

    try {
      const response = await fetch(`/api/inventories/${params.id}/items/${params.itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          tags: formData.tags,
          customFieldValues: customFieldValues,
        }),
      });

      if (response.ok) {
        router.push(`/inventories/${params.id}/items/${params.itemId}`);
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || t("error_update_item") || "Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      alert(t("error_update_item") || "Failed to update item");
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t("common.loading") || "Loading..."}</div>
      </div>
    );
  }

  if (!item || !inventory || !session) {
    return null;
  }

  const isOwner = session.user.id === inventory.creator.id;
  const isAdmin = (session.user as { role?: string })?.role === "admin";
  const canEdit = isOwner || isAdmin;

  if (!canEdit) {
    router.push(`/inventories/${params.id}/items/${params.itemId}`);
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
            <Link href={`/inventories/${params.id}/items/${item.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {item.name}
            </Link>
            <span>→</span>
            <span>{t("common.edit")}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("edit_item") || "Edit Item"}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t("edit_item_subtitle") || "Update item information and custom field values"}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("item_information") || "Item Information"}</h2>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">{t("item_name") || "Item Name"} *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
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
                <ItemForm customFields={inventory.customFields} onValuesChange={setCustomFieldValues} initialValues={customFieldValues} />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 sticky bottom-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition">
                {t("cancel") || "Cancel"}
              </button>
              <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition">
                {saving ? t("updating_item") || "Updating..." : t("save_item") || "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
