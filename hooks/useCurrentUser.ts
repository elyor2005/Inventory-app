"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  blocked: boolean;
  currentProvider?: string;
};

/**
 * Custom hook to get current user with provider-specific data
 * This fetches from the API to ensure we get the latest provider data
 */
export function useCurrentUser() {
  const { data: session, isPending: sessionPending } = useSession();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      // If no session, user is not logged in
      if (!sessionPending && !session) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Wait for session to load
      if (sessionPending) {
        return;
      }

      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          if (response.status === 401) {
            setUser(null);
            setIsLoading(false);
            return;
          }
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        setUser(data.user);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [session, sessionPending]);

  return {
    user,
    isLoading: isLoading || sessionPending,
    error,
    refetch: () => {
      setIsLoading(true);
      // Trigger re-fetch by updating a dependency
      setUser(null);
    },
  };
}
