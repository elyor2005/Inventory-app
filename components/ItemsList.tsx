"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import LikeButton from "./LikeButton";
interface Item {
  id: string;
  name: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface ItemsListProps {
  inventoryId: string;
  canEdit: boolean;
  isPublic: boolean;
}

export default function ItemsList({ inventoryId, canEdit, isPublic }: ItemsListProps) {
  const { t } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryId]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inventories/${inventoryId}/items`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm(t("delete_item_confirm") || "Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const response = await fetch(`/api/inventories/${inventoryId}/items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== itemId));
        alert(t("item_deleted") || "Item deleted successfully");
      } else {
        alert(t("error_delete_item") || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert(t("error_delete_item") || "Failed to delete item");
    }
  };

  // Get all unique tags
  const allTags = Array.from(new Set(items.flatMap((item) => item.tags)));

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = !selectedTag || item.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t("common.loading") || "Loading..."}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t("items") || "Items"} ({items.length})
        </h2>
        {(canEdit || isPublic) && (
          <Link href={`/inventories/${inventoryId}/items/new`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
            + {t("add_item") || "Add Item"}
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        // Empty State
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("no_items") || "No items yet"}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t("no_items_desc") || "Start by adding your first item to this inventory"}</p>
          {(canEdit || isPublic) && (
            <Link href={`/inventories/${inventoryId}/items/new`} className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
              {t("add_first_item") || "Add First Item"}
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("search_items") || "Search items..."} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <select value={selectedTag || ""} onChange={(e) => setSelectedTag(e.target.value || null)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                <option value="">{t("all_tags") || "All Tags"}</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Results Count */}
          {(searchQuery || selectedTag) && <div className="text-sm text-gray-600 dark:text-gray-400">{t("showing_items") ? String(t("showing_items")).replace("{count}", filteredItems.length.toString()).replace("{total}", items.length.toString()) : `Showing ${filteredItems.length} of ${items.length} items`}</div>}

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md">
                {/* Item Header */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {item.creator.image && <img src={item.creator.image} alt={item.creator.name || "User"} className="w-4 h-4 rounded-full" />}
                    <span>{item.creator.name || item.creator.email}</span>
                    <span>•</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Link href={`/inventories/${inventoryId}/items/${item.id}`} className="flex-1 text-center px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded transition">
                    {t("view_details") || "View"}
                  </Link>
                  {canEdit && (
                    <>
                      <Link href={`/inventories/${inventoryId}/items/${item.id}/edit`} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition">
                        {t("common.edit")}
                      </Link>
                      <button onClick={() => deleteItem(item.id)} className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded transition">
                        {t("common.delete")}
                      </button>
                    </>
                  )}
                </div>
                {/* Like Button */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <LikeButton itemId={item.id} inventoryId={inventoryId} showCount={true} />
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (searchQuery || selectedTag) && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">{t("no_results") || "No items found matching your search"}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
