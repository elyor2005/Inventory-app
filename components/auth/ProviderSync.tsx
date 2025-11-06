"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useRef } from "react";

/**
 * Component that syncs provider data after OAuth login
 * Place this in your layout or main page to ensure provider data is synced
 */
export default function ProviderSync() {
  const { data: session } = useSession();
  const syncedRef = useRef(false);

  useEffect(() => {
    const syncProviderData = async () => {
      // Only sync once per session
      if (syncedRef.current || !session?.user) return;

      // Check if we just completed an OAuth flow
      const urlParams = new URLSearchParams(window.location.search);
      const isOAuthCallback = urlParams.has("code") || urlParams.has("state");

      // Get the provider from URL or localStorage
      const provider = localStorage.getItem("lastOAuthProvider");

      if (provider && (isOAuthCallback || !syncedRef.current)) {
        syncedRef.current = true;

        try {
          const response = await fetch("/api/auth/sync-provider", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider }),
          });

          if (response.ok) {
            // Clear the stored provider after successful sync
            localStorage.removeItem("lastOAuthProvider");

            // Reload the page to fetch updated user data
            // This ensures the useCurrentUser hook gets the latest provider-specific data
            window.location.href = window.location.pathname;
          }
        } catch (error) {
          syncedRef.current = false; // Allow retry on next mount
        }
      }
    };

    syncProviderData();
  }, [session]);

  return null; // This component doesn't render anything
}
