"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useToast } from "@/components/providers/ToastProvider";
import ReactMarkdown from "react-markdown";
import CommentForm from "@/components/CommentForm";
import { useCommentPolling } from "@/hooks/useCommentPolling";

interface Comment {
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
  parentId: string | null;
  replies?: Comment[];
}

interface CommentsSectionProps {
  itemId: string;
  inventoryId: string;
}

export default function CommentsSection({ itemId, inventoryId }: CommentsSectionProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());

  // Use the polling hook for real-time updates
  const { newItemIds, setNewItemIds, setCurrentItems } = useCommentPolling<Comment>({
    fetchUrl: `/api/inventories/${inventoryId}/items/${itemId}/comments`,
    onDataUpdate: setComments,
    enabled: !loading,
    isUserInteracting: editingId !== null || replyingTo !== null || posting || newComment.trim().length > 0,
    extractItems: (data) => data.comments,
    getItemId: (item) => item.id,
    checkNested: (item, callback) => {
      if (item.replies) {
        callback(item.replies);
      }
    },
  });

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inventories/${inventoryId}/items/${itemId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setCurrentItems(data.comments);
        setNewItemIds(new Set());
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
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
      const response = await fetch(`/api/inventories/${inventoryId}/items/${itemId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        setNewComment("");
        fetchComments();
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

  const handlePostReply = async (parentId: string) => {
    if (!replyContent.trim()) {
      showToast(t("comment_required") || "Comment cannot be empty", "error");
      return;
    }

    setPosting(true);
    try {
      const response = await fetch(`/api/inventories/${inventoryId}/items/${itemId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, parentId }),
      });

      if (response.ok) {
        setReplyContent("");
        setReplyingTo(null);
        fetchComments();
        setShowReplies((prev) => new Set(prev).add(parentId));
      } else {
        showToast(t("error_post_comment") || "Failed to post reply", "error");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      showToast(t("error_post_comment") || "Failed to post reply", "error");
    } finally {
      setPosting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      showToast(t("comment_required") || "Comment cannot be empty", "error");
      return;
    }

    try {
      const response = await fetch(`/api/inventories/${inventoryId}/items/${itemId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditContent("");
        fetchComments();
      } else {
        showToast(t("error_update_comment") || "Failed to update comment", "error");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      showToast(t("error_update_comment") || "Failed to update comment", "error");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(t("delete_comment_confirm") || "Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/inventories/${inventoryId}/items/${itemId}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchComments();
      } else {
        showToast(t("error_delete_comment") || "Failed to delete comment", "error");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast(t("error_delete_comment") || "Failed to delete comment", "error");
    }
  };

  const toggleReplies = (commentId: string) => {
    const newShowReplies = new Set(showReplies);
    if (newShowReplies.has(commentId)) {
      newShowReplies.delete(commentId);
    } else {
      newShowReplies.add(commentId);
    }
    setShowReplies(newShowReplies);
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isAuthor = session?.user.id === comment.author.id;
    const isEditing = editingId === comment.id;
    const isReplying = replyingTo === comment.id;
    const isNew = newItemIds.has(comment.id);

    return (
      <div key={comment.id} className={`${isReply ? "ml-12 mt-3" : ""} ${isNew ? "animate-fadeIn" : ""}`}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.author.image ? (
              <div className="relative w-10 h-10">
                <Image src={comment.author.image} alt={comment.author.name || "User"} fill className="rounded-full object-cover" sizes="40px" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">{(comment.author.name || comment.author.email)[0].toUpperCase()}</div>
            )}
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${isNew ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{comment.author.name || comment.author.email}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                  {comment.createdAt !== comment.updatedAt && <span className="text-xs text-gray-400 dark:text-gray-500 italic">{t("comment_edited") || "(edited)"}</span>}
                </div>

                {/* Actions */}
                {isAuthor && !isEditing && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {t("edit") || "Edit"}
                    </button>
                    <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-red-600 dark:text-red-400 hover:underline">
                      {t("delete") || "Delete"}
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              {isEditing ? (
                <div className="space-y-2">
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  <div className="flex gap-2">
                    <button onClick={() => handleEditComment(comment.id)} className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded">
                      {t("save") || "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent("");
                      }}
                      className="px-3 py-1 text-sm bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 rounded"
                    >
                      {t("cancel") || "Cancel"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{comment.content}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Reply Button */}
            {!isEditing && session && !isReply && (
              <button onClick={() => setReplyingTo(comment.id)} className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                {t("reply") || "Reply"}
              </button>
            )}

            {/* Reply Form */}
            {isReplying && (
              <div className="mt-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{(t("reply_to") || "Reply to {name}").replace("{name}", comment.author.name || comment.author.email)}</div>
                <CommentForm
                  value={replyContent}
                  onChange={setReplyContent}
                  onSubmit={() => handlePostReply(comment.id)}
                  placeholder={t("write_reply") || "Write a reply..."}
                  submitLabel={t("post_reply") || "Post Reply"}
                  cancelLabel={t("cancel") || "Cancel"}
                  onCancel={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                  isSubmitting={posting}
                  showCancel={true}
                  minHeight="min-h-[80px]"
                />
              </div>
            )}

            {/* Show Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3">
                <button onClick={() => toggleReplies(comment.id)} className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1">
                  <span>{showReplies.has(comment.id) ? "▼" : "▶"}</span>
                  <span>
                    {showReplies.has(comment.id) ? t("hide_replies") || "Hide replies" : t("show_replies") || "Show {count} replies"}{" "}
                    {!showReplies.has(comment.id) && `(${comment.replies.length})`}
                  </span>
                </button>

                {showReplies.has(comment.id) && <div className="mt-2">{comment.replies.map((reply) => renderComment(reply, true))}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">{t("loading") || "Loading..."}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("comments") || "Comments"} ({comments.length})
        </h3>
      </div>

      {/* New Comment Form */}
      {session && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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
              />
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400">{t("no_comments_yet") || "No comments yet. Be the first to comment!"}</div>
          </div>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
}
