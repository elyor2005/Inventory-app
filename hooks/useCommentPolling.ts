import { useEffect, useState, useCallback } from "react";

interface UseCommentPollingOptions<T> {
  fetchUrl: string;
  onDataUpdate: (data: T[]) => void;
  enabled?: boolean;
  interval?: number;
  isUserInteracting?: boolean;
  extractItems: (response: any) => T[];
  getItemId: (item: T) => string;
  checkNested?: (item: T, callback: (nested: T[]) => void) => void;
}

/**
 * Custom hook for real-time polling of comments/discussions
 * Handles new item detection, quiet fetching, and animation timing
 */
export function useCommentPolling<T>({
  fetchUrl,
  onDataUpdate,
  enabled = true,
  interval = 3000,
  isUserInteracting = false,
  extractItems,
  getItemId,
  checkNested,
}: UseCommentPollingOptions<T>) {
  const [currentItems, setCurrentItems] = useState<T[]>([]);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());

  // Quiet fetch without loading state (for background polling)
  const fetchQuietly = useCallback(async () => {
    try {
      const response = await fetch(fetchUrl);
      if (response.ok) {
        const data = await response.json();
        const newItems = extractItems(data);

        // Detect new items
        const existingIds = new Set(currentItems.map(getItemId));
        const newIds = new Set<string>();

        const checkForNew = (itemsList: T[]) => {
          itemsList.forEach((item) => {
            const itemId = getItemId(item);
            if (!existingIds.has(itemId)) {
              newIds.add(itemId);
            }
            // Check nested items (for replies/threads)
            if (checkNested) {
              checkNested(item, checkForNew);
            }
          });
        };

        checkForNew(newItems);

        // Update items
        setCurrentItems(newItems);
        onDataUpdate(newItems);

        // Mark new items and clear indicator after 5 seconds
        if (newIds.size > 0) {
          setNewItemIds(newIds);
          setTimeout(() => {
            setNewItemIds(new Set());
          }, 5000);
        }
      }
    } catch (error) {
      // Silently fail for background polling
      console.debug("Background fetch failed:", error);
    }
  }, [fetchUrl, currentItems, extractItems, getItemId, checkNested, onDataUpdate]);

  // Real-time polling effect
  useEffect(() => {
    // Don't poll if not enabled or user is actively interacting
    if (!enabled || isUserInteracting) {
      return;
    }

    const pollInterval = setInterval(() => {
      fetchQuietly();
    }, interval);

    return () => clearInterval(pollInterval);
  }, [enabled, isUserInteracting, interval, fetchQuietly]);

  // Update current items when external data changes
  useEffect(() => {
    // This allows the parent to update items via initial fetch
  }, []);

  return {
    newItemIds,
    setNewItemIds,
    setCurrentItems,
  };
}
