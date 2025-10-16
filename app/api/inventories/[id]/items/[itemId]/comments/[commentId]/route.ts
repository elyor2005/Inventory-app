import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

// PATCH update comment
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string; commentId: string }> }) {
  try {
    const { itemId, commentId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.itemId !== itemId) {
      return Response.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if user is the author
    if (comment.authorId !== user.id && user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return Response.json({ comment: updatedComment });
  } catch (error) {
    console.error("Error updating comment:", error);
    return Response.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

// DELETE comment
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string; commentId: string }> }) {
  try {
    const { itemId, commentId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.itemId !== itemId) {
      return Response.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if user is the author or admin
    if (comment.authorId !== user.id && user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete comment and all its replies (cascade)
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return Response.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return Response.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
