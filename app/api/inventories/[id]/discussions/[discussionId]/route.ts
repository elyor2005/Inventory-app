import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

// DELETE - Delete a discussion comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; discussionId: string }> }
) {
  try {
    const { discussionId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the discussion comment
    const discussion = await prisma.inventoryComment.findUnique({
      where: { id: discussionId },
      select: {
        authorId: true,
        inventory: {
          select: {
            creatorId: true,
          },
        },
      },
    });

    if (!discussion) {
      return Response.json({ error: "Discussion not found" }, { status: 404 });
    }

    // Check permissions - only author, inventory owner, or admin can delete
    const canDelete =
      discussion.authorId === user.id ||
      discussion.inventory.creatorId === user.id ||
      user.role === "admin";

    if (!canDelete) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the comment
    await prisma.inventoryComment.delete({
      where: { id: discussionId },
    });

    return Response.json({ message: "Discussion deleted successfully" });
  } catch (error) {
    console.error("Error deleting discussion:", error);
    return Response.json(
      { error: "Failed to delete discussion" },
      { status: 500 }
    );
  }
}
