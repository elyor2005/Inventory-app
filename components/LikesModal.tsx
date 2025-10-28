"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Like {
  id: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface LikesModalProps {
  itemId: string;
  inventoryId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function LikesModal({ itemId, inventoryId, isOpen, onClose }: LikesModalProps) {
  const { t } = useLanguage();
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLikes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inventories/${inventoryId}/items/${itemId}/likes`);
      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes);
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    } finally {
      setLoading(false);
    }
  }, [inventoryId, itemId]);

  useEffect(() => {
    if (isOpen) {
      fetchLikes();
    }
  }, [isOpen, fetchLikes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("who_liked") || "Who Liked This"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : likes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">❤️</div>
              <p className="text-gray-500 dark:text-gray-400">{t("no_likes_yet") || "No likes yet"}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {likes.map((like) => (
                <div key={like.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  {/* Avatar */}
                  {like.user.image ? (
                    <div className="relative w-10 h-10">
                      <Image src={like.user.image} alt={like.user.name || "User"} fill className="rounded-full object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">{(like.user.name || like.user.email)[0].toUpperCase()}</div>
                  )}

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white">{like.user.name || like.user.email}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t("liked_on") || "Liked on"} {new Date(like.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Heart Icon */}
                  <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
