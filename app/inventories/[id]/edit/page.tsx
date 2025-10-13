"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";
import CustomFieldsBuilder from "@/components/CustomFieldsBuilder";
import { useLanguage } from "@/components/providers/LanguageProvider";

const CATEGORIES = ["Equipment", "Furniture", "Books", "Documents", "Electronics", "Other"];

interface CustomFieldDefinition {
  name: string;
  type: string;
  label: string;
  required: boolean;
}

interface Inventory {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string | null;
  isPublic: boolean;
  tags: string[];
  customFields: CustomFieldDefinition[];
  version: number;
  creator: {
    id: string;
  };
}

export default function EditInventoryPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Equipment",
    image: "",
    tags: [] as string[],
    isPublic: false,
    version: 0,
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchInventory();
  }, [params.id]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inventories/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory);
        setFormData({
          title: data.inventory.title,
          description: data.inventory.description,
          category: data.inventory.category,
          image: data.inventory.image || "",
          tags: data.inventory.tags,
          isPublic: data.inventory.isPublic,
          version: data.inventory.version,
        });
        // Set custom fields
        setCustomFields(data.inventory.customFields || []);
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

    // Validate custom fields have labels
    const invalidFields = customFields.filter((f) => !f.label.trim());
    if (invalidFields.length > 0) {
      alert(t("inventory.new.customFieldsError"));
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/inventories/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          customFields: customFields,
        }),
      });

      if (response.ok) {
        router.push(`/inventories/${params.id}`);
      } else if (response.status === 409) {
        alert(t("edit.conflictError"));
        fetchInventory();
      } else {
        const error = await response.json();
        alert(error.error || t("edit.updateError"));
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      alert(t("edit.updateError"));
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
        <div className="text-lg">{t("common.loading")}</div>
      </div>
    );
  }

  if (!inventory || !session) {
    return null;
  }

  const isOwner = session.user.id === inventory.creator.id;
  const isAdmin = session.user.role === "admin";

  if (!isOwner && !isAdmin) {
    router.push(`/inventories/${params.id}`);
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("edit.title")}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t("edit.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("inventory.new.basicInfo")}</h2>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">{t("inventory.new.titleLabel")} *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t("inventory.new.descriptionLabel")} * <span className="text-gray-500 text-xs">{t("inventory.new.markdownSupported")}</span>
                </label>
                <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={6} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">{t("inventory.new.categoryLabel")} *</label>
                <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`categories.${cat.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t("inventory.new.imageLabel")} <span className="text-gray-500 text-xs">{t("inventory.new.imageOptional")}</span>
                </label>
                <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder={t("inventory.new.imagePlaceholder")} />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="mt-2 w-full max-h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t("inventory.new.tagsLabel")} <span className="text-gray-500 text-xs">{t("inventory.new.imageOptional")}</span>
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
                    placeholder={t("edit.addTag")}
                  />
                  <button type="button" onClick={addTag} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition">
                    {t("common.add")}
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

              {/* Public/Private */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isPublic" checked={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-900 dark:text-white">
                  {t("inventory.new.publicLabel")}
                </label>
              </div>
            </div>

            {/* Custom Fields Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <CustomFieldsBuilder fields={customFields} onChange={setCustomFields} />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 sticky bottom-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition">
                {t("common.cancel")}
              </button>
              <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition">
                {saving ? t("edit.saving") : t("edit.saveChanges")}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
