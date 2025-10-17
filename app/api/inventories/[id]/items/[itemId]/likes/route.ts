import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

// GET all likes for an item
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const { itemId } = await params;
    const likes = await prisma.like.findMany({
      where: { itemId: itemId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({ likes });
  } catch (error) {
    console.error("Error fetching likes:", error);
    return Response.json({ error: "Failed to fetch likes" }, { status: 500 });
  }
}

// POST - Like an item
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const { id, itemId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item || item.inventoryId !== id) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        itemId_userId: {
          itemId: itemId,
          userId: user.id,
        },
      },
    });

    if (existingLike) {
      return Response.json({ error: "Already liked" }, { status: 400 });
    }

    // Create like
    const like = await prisma.like.create({
      data: {
        itemId: itemId,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return Response.json({ like }, { status: 201 });
  } catch (error) {
    console.error("Error creating like:", error);
    return Response.json({ error: "Failed to like item" }, { status: 500 });
  }
}

// DELETE - Unlike an item
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const { itemId } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find and delete the like
    const like = await prisma.like.findUnique({
      where: {
        itemId_userId: {
          itemId: itemId,
          userId: user.id,
        },
      },
    });

    if (!like) {
      return Response.json({ error: "Like not found" }, { status: 404 });
    }

    await prisma.like.delete({
      where: { id: like.id },
    });

    return Response.json({ message: "Like removed successfully" });
  } catch (error) {
    console.error("Error removing like:", error);
    return Response.json({ error: "Failed to unlike item" }, { status: 500 });
  }
}
