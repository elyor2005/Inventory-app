"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useToast } from "@/components/providers/ToastProvider";
import ReactMarkdown from "react-markdown";
import CommentForm from "@/components/CommentForm";
import { useCommentPolling } from "@/hooks/useCommentPolling";

interface Discussion {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface InventoryDiscussionProps {
  inventoryId: string;
  canComment: boolean;
}

export default function InventoryDiscussion({ inventoryId, canComment }: InventoryDiscussionProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  // Use the polling hook for real-time updates
  const { newItemIds, setNewItemIds, setCurrentItems } = useCommentPolling<Discussion>({
    fetchUrl: `/api/inventories/${inventoryId}/discussions`,
    onDataUpdate: setDiscussions,
    enabled: !loading,
    isUserInteracting: posting || newComment.trim().length > 0,
    extractItems: (data) => data.discussions,
    getItemId: (item) => item.id,
  });

  useEffect(() => {
    fetchDiscussions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryId]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inventories/${inventoryId}/discussions`);
      if (response.ok) {
        const data = await response.json();
        setDiscussions(data.discussions);
        setCurrentItems(data.discussions);
        setNewItemIds(new Set());
      }
    } catch (error) {
      console.error("Error fetching discussions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) {
      showToast(t("comment_required") || "Comment cannot be empty", "error");
      return;
    }

    setPosting(true);
    try {
      const response = await fetch(`/api/inventories/${inventoryId}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        setNewComment("");
        fetchDiscussions();
        showToast(t("comment_posted") || "Comment posted successfully", "success");
      } else {
        showToast(t("error_post_comment") || "Failed to post comment", "error");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      showToast(t("error_post_comment") || "Failed to post comment", "error");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(t("delete_comment_confirm") || "Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/inventories/${inventoryId}/discussions/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchDiscussions();
        showToast(t("comment_deleted") || "Comment deleted successfully", "success");
      } else {
        showToast(t("error_delete_comment") || "Failed to delete comment", "error");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast(t("error_delete_comment") || "Failed to delete comment", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">{t("loading") || "Loading..."}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("discussion") || "Discussion"}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {discussions.length} {discussions.length === 1 ? t("comment") || "comment" : t("comments") || "comments"}
          </p>
        </div>
      </div>

      {/* Comment Input - Only for authenticated users */}
      {session && canComment && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              {session.user.image ? (
                <Image src={session.user.image} alt={session.user.name || "User"} fill className="rounded-full object-cover" sizes="40px" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold">
                  {(session.user.name || session.user.email)?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <CommentForm
                value={newComment}
                onChange={setNewComment}
                onSubmit={handlePostComment}
                placeholder={t("write_comment") || "Write a comment... (Markdown supported)"}
                submitLabel={t("post_comment") || "Post Comment"}
                isSubmitting={posting}
                minHeight="min-h-[76px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt for Unauthenticated Users */}
      {!session && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
          <p className="text-gray-700 dark:text-gray-300">
            {t("login_to_comment") || "Please"}{" "}
            <Link href="/api/auth/signin" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              {t("login") || "login"}
            </Link>{" "}
            {t("to_join_discussion") || "to join the discussion"}
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400">{t("no_comments") || "No comments yet. Be the first to start the discussion!"}</div>
          </div>
        ) : (
          discussions.map((discussion) => {
            const isAuthor = session?.user.id === discussion.author.id;
            const isNew = newItemIds.has(discussion.id);

            return (
              <div key={discussion.id} className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${isNew ? "animate-fadeIn border-blue-300 dark:border-blue-600" : ""}`}>
                <div className="flex gap-3">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    {discussion.author.image ? (
                      <Image src={discussion.author.image} alt={discussion.author.name || "User"} fill className="rounded-full object-cover" sizes="40px" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold">
                        {(discussion.author.name || discussion.author.email)?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Link href={`/user/${discussion.author.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                          {discussion.author.name || discussion.author.email}
                        </Link>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(discussion.createdAt).toLocaleString()}
                        </span>
                        {isNew && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">{t("new") || "New"}</span>}
                      </div>

                      {isAuthor && (
                        <button onClick={() => handleDeleteComment(discussion.id)} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm" title={t("delete") || "Delete"}>
                          🗑️
                        </button>
                      )}
                    </div>

                    <div className="prose dark:prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{discussion.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
