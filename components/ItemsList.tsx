"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useToast } from "@/components/providers/ToastProvider";
import LikeButton from "./LikeButton";
import { ItemCardSkeleton } from "./LoadingSkeleton";
import { Edit, Trash2 } from "lucide-react";
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedItems.size > 0 ? `${selectedItems.size} ${t("selected") || "selected"}` : t("no_items_selected") || "No items selected"}
          </span>
          {selectedItems.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Show Edit button when exactly 1 item is selected */}
              {selectedItems.size === 1 && (
                <Link
                  href={`/inventories/${inventoryId}/items/${Array.from(selectedItems)[0]}/edit`}
                  className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition flex items-center gap-1 flex-1 sm:flex-initial justify-center"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("common.edit") || "Edit"}</span>
                </Link>
              )}
              <button onClick={handleBulkDelete} className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition flex items-center gap-1 flex-1 sm:flex-initial justify-center">
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t("delete") || "Delete"}</span>
              </button>
              <button onClick={() => { setSelectedItems(new Set()); setSelectAll(false); }} className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded transition flex-1 sm:flex-initial">
                {t("clear_selection") || "Clear"}
              </button>
            </div>
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

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {/* Header Row with Checkbox and Custom ID */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {canEdit && (
                      <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => handleSelectItem(item.id)} className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                    )}
                    {item.customId && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                        {item.customId}
                      </span>
                    )}
                  </div>
                  <LikeButton itemId={item.id} inventoryId={inventoryId} showCount={true} />
                </div>

                {/* Item Name - Clickable */}
                <Link href={`/inventories/${inventoryId}/items/${item.id}`} className="block mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition">
                    {item.name}
                  </h3>
                </Link>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs whitespace-nowrap">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Creator and Date */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    {item.creator.image && (
                      <div className="relative w-5 h-5 flex-shrink-0">
                        <Image src={item.creator.image} alt={item.creator.name || "User"} fill className="rounded-full object-cover" sizes="20px" />
                      </div>
                    )}
                    <span className="truncate">{item.creator.name || item.creator.email}</span>
                  </div>
                  <span className="text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
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
