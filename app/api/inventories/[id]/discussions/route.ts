import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

// GET - List all discussions for an inventory
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if inventory exists
    const inventory = await prisma.inventory.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!inventory) {
      return Response.json({ error: "Inventory not found" }, { status: 404 });
    }

    // Get all discussions (linear, ordered by creation time)
    const discussions = await prisma.inventoryComment.findMany({
      where: { inventoryId: id },
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

    return Response.json({ discussions });
  } catch (error) {
    console.error("Error fetching discussions:", error);
    return Response.json(
      { error: "Failed to fetch discussions" },
      { status: 500 }
    );
  }
}

// POST - Create a new discussion comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return Response.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Check if inventory exists
    const inventory = await prisma.inventory.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!inventory) {
      return Response.json({ error: "Inventory not found" }, { status: 404 });
    }

    // Create discussion comment
    const discussion = await prisma.inventoryComment.create({
      data: {
        content: content.trim(),
        inventoryId: id,
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

    return Response.json({ discussion }, { status: 201 });
  } catch (error) {
    console.error("Error creating discussion:", error);
    return Response.json(
      { error: "Failed to create discussion comment" },
      { status: 500 }
    );
  }
}
