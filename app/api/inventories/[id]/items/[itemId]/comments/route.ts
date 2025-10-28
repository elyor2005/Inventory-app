import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

// GET comments for an item
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const { itemId } = await params;
    const comments = await prisma.comment.findMany({
      where: {
        itemId: itemId,
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
      orderBy: {
        createdAt: "asc", // Linear order - oldest first
      },
    });

    return Response.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return Response.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST new comment
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const { id, itemId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }

    // Verify item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item || item.inventoryId !== id) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        itemId: itemId,
        authorId: user.id,
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

    return Response.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return Response.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
