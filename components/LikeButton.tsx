"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useToast } from "@/components/providers/ToastProvider";

interface LikeButtonProps {
  itemId: string;
  inventoryId: string;
  initialLikes?: number;
  initialLiked?: boolean;
  showCount?: boolean;
}

export default function LikeButton({ itemId, inventoryId, initialLikes = 0, initialLiked = false, showCount = true }: LikeButtonProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      checkLikeStatus();
    }
  }, [session, itemId]);

  const checkLikeStatus = async () => {
    try {
      const response = await fetch(`/api/inventories/${inventoryId}/items/${itemId}/likes/check`);
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
        setLikes(data.count);
      }
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const handleLike = async () => {
    if (!session) {
      showToast(t("login_required") || "Please log in to like items", "info");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/inventories/${inventoryId}/items/${itemId}/likes`, {
        method: isLiked ? "DELETE" : "POST",
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);
      } else {
        showToast(isLiked ? t("error_unlike") || "Failed to unlike" : t("error_like") || "Failed to like", "error");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      showToast(isLiked ? t("error_unlike") || "Failed to unlike" : t("error_like") || "Failed to like", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleLike} disabled={isLoading} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${isLiked ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
      {/* Heart Icon */}
      <svg className={`w-5 h-5 ${isLiked ? "fill-current" : "fill-none"}`} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>

      {/* Text */}
      <span className="text-sm">{isLiked ? t("unlike") || "Unlike" : t("like") || "Like"}</span>

      {/* Count */}
      {showCount && likes > 0 && <span className="text-sm font-bold">{likes}</span>}
    </button>
  );
}
