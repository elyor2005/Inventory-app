import { useEffect, useRef, useState, useCallback } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "conflict";

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<{ success: boolean; error?: string; isConflict?: boolean }>;
  interval?: number; // in milliseconds, default 8000 (8 seconds)
  enabled?: boolean;
  debounceDelay?: number; // delay before triggering save after change, default 2000ms
}

export function useAutoSave<T>({
  data,
  onSave,
  interval = 8000, // 8 seconds - within 7-10 second requirement
  enabled = true,
  debounceDelay = 2000,
}: UseAutoSaveOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const dataRef = useRef<T>(data);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Save function
  const save = useCallback(async () => {
    if (isSavingRef.current || !hasUnsavedChanges) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus("saving");

    try {
      const result = await onSave(dataRef.current);

      if (result.success) {
        setSaveStatus("saved");
        setLastSaved(new Date());
        setHasUnsavedChanges(false);

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setSaveStatus("idle");
        }, 2000);
      } else if (result.isConflict) {
        setSaveStatus("conflict");
        setHasUnsavedChanges(false); // Don't auto-save again on conflict
      } else {
        setSaveStatus("error");
        // Keep unsaved changes flag so user can retry
      }
    } catch (error) {
      console.error("Auto-save error:", error);
      setSaveStatus("error");
    } finally {
      isSavingRef.current = false;
    }
  }, [hasUnsavedChanges, onSave]);

  // Manual save function (for user-triggered saves)
  const saveNow = useCallback(async () => {
    // Clear any pending auto-saves
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    await save();
  }, [save]);

  // Detect data changes
  useEffect(() => {
    const hasChanged = JSON.stringify(dataRef.current) !== JSON.stringify(data);

    if (hasChanged && enabled) {
      dataRef.current = data;
      setHasUnsavedChanges(true);

      // Clear existing debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new debounce timeout
      debounceTimeoutRef.current = setTimeout(() => {
        save();
      }, debounceDelay);
    }
  }, [data, enabled, debounceDelay, save]);

  // Periodic auto-save interval
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      if (hasUnsavedChanges && !isSavingRef.current) {
        save();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, hasUnsavedChanges, save]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Save before unload if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return {
    saveStatus,
    lastSaved,
    hasUnsavedChanges,
    saveNow,
  };
}
