"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useToast } from "@/components/providers/ToastProvider";
import LikeButton from "./LikeButton";
import { ItemCardSkeleton } from "./LoadingSkeleton";
interface Item {
  id: string;
  name: string;
  customId?: string | null;
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
  const { showToast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

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

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredItems.length && filteredItems.length > 0);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    if (!confirm(t("delete_selected_items_confirm") || `Are you sure you want to delete ${selectedItems.size} item(s)?`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedItems).map((itemId) =>
        fetch(`/api/inventories/${inventoryId}/items/${itemId}`, {
          method: "DELETE",
        })
      );

      await Promise.all(deletePromises);
      setItems(items.filter((item) => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
      setSelectAll(false);
      showToast(t("items_deleted") || `${selectedItems.size} item(s) deleted successfully`, "success");
    } catch (error) {
      console.error("Error deleting items:", error);
      showToast(t("error_delete_items") || "Failed to delete some items", "error");
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
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
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

      {/* Toolbar - Only show when canEdit and items exist */}
      {canEdit && items.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedItems.size > 0 ? `${selectedItems.size} ${t("selected") || "selected"}` : t("no_items_selected") || "No items selected"}
          </span>
          {selectedItems.size > 0 && (
            <>
              {/* Show Edit button when exactly 1 item is selected */}
              {selectedItems.size === 1 && (
                <Link
                  href={`/inventories/${inventoryId}/items/${Array.from(selectedItems)[0]}/edit`}
                  className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t("common.edit") || "Edit"}
                </Link>
              )}
              <button onClick={handleBulkDelete} className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t("delete") || "Delete"}
              </button>
              <button onClick={() => { setSelectedItems(new Set()); setSelectAll(false); }} className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded transition">
                {t("clear_selection") || "Clear Selection"}
              </button>
            </>
          )}
        </div>
      )}

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

          {/* Items Table */}
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {canEdit && (
                    <th className="w-12 px-4 py-3 text-left">
                      <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("custom_id") || "ID"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("item_name") || "Name"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("tags") || "Tags"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("creator") || "Creator"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("created_at") || "Created"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("likes") || "Likes"}</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={(e) => {
                      // Don't navigate if clicking on checkbox or interactive elements
                      if (
                        (e.target as HTMLElement).tagName === 'INPUT' ||
                        (e.target as HTMLElement).closest('input') ||
                        (e.target as HTMLElement).closest('button') ||
                        (e.target as HTMLElement).closest('a')
                      ) {
                        return;
                      }
                      window.location.href = `/inventories/${inventoryId}/items/${item.id}`;
                    }}
                  >
                    {canEdit && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => handleSelectItem(item.id)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      {item.customId ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                          {item.customId}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs whitespace-nowrap">
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && <span className="text-xs text-gray-500 dark:text-gray-400">+{item.tags.length - 3}</span>}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500 italic">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        {item.creator.image && (
                          <div className="relative w-6 h-6 flex-shrink-0">
                            <Image src={item.creator.image} alt={item.creator.name || "User"} fill className="rounded-full object-cover" sizes="24px" />
                          </div>
                        )}
                        <span className="truncate max-w-[150px]">{item.creator.name || item.creator.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <LikeButton itemId={item.id} inventoryId={inventoryId} showCount={true} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
