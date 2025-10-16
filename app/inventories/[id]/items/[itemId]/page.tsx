/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/components/providers/LanguageProvider";
import CommentsSection from "@/components/CommentsSection";
interface Item {
  id: string;
  name: string;
  tags: string[];
  stringValues: any;
  textValues: any;
  integerValues: any;
  dateValues: any;
  booleanValues: any;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface Inventory {
  id: string;
  title: string;
  customFields: any[];
  creator: {
    id: string;
  };
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();

  const [item, setItem] = useState<Item | null>(null);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);

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

  const deleteItem = async () => {
    if (!confirm(t("delete_item_confirm") || "Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const response = await fetch(`/api/inventories/${params.id}/items/${params.itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(`/inventories/${params.id}`);
      } else {
        alert(t("error_delete_item") || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert(t("error_delete_item") || "Failed to delete item");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t("loading") || "Loading..."}</div>
      </div>
    );
  }

  if (!item || !inventory) {
    return null;
  }

  const isOwner = session?.user.id === inventory.creator.id;
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  const canEdit = isOwner || isAdmin;

  // Combine all custom field values
  const allValues = {
    ...item.stringValues,
    ...item.textValues,
    ...item.integerValues,
    ...item.dateValues,
    ...item.booleanValues,
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
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
            <span>{item.name}</span>
          </div>

          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{item.name}</h1>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    {item.creator.image && <img src={item.creator.image} alt={item.creator.name || "User"} className="w-6 h-6 rounded-full" />}
                    <span>
                      {t("created_by") || "Created by"} {item.creator.name || item.creator.email}
                    </span>
                  </div>
                  <span>•</span>
                  <span>
                    {t("created_on") || "Created"}: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {canEdit && (
                <div className="flex gap-2">
                  <Link href={`/inventories/${params.id}/items/${item.id}/edit`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                    {t("edit") || "Edit"}
                  </Link>
                  <button onClick={deleteItem} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition">
                    {t("delete") || "Delete"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Custom Fields Values */}
          {inventory.customFields && inventory.customFields.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t("custom_field_values") || "Custom Field Values"}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inventory.customFields.map((field: any, index: number) => {
                  const value = allValues[field.name];

                  return (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">({field.type})</span>
                      </div>
                      <div className="text-lg text-gray-900 dark:text-white">{field.type === "boolean" ? <span className={`inline-flex px-2 py-1 rounded text-sm ${value ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400"}`}>{value ? t("yes") || "Yes" : t("no") || "No"}</span> : field.type === "date" ? value ? new Date(value).toLocaleDateString() : "-" : value !== undefined && value !== null ? value.toString() : <span className="text-gray-400 italic">{t("not_set") || "Not set"}</span>}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Comments Section */}
          <div className="mt-8">
            <CommentsSection itemId={item.id} inventoryId={params.id as string} />
          </div>

          {/* Back Button */}
          <div className="mt-6">
            <Link href={`/inventories/${params.id}`} className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
              ← {t("back_to_items") || "Back to Items"}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
