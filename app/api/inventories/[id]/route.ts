import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

// GET single inventory
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const inventory = await prisma.inventory.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!inventory) {
      return Response.json({ error: "Inventory not found" }, { status: 404 });
    }

    return Response.json({ inventory });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return Response.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

// PATCH update inventory
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, image, tags, isPublic, version } = body;

    // Get existing inventory
    const existing = await prisma.inventory.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return Response.json({ error: "Inventory not found" }, { status: 404 });
    }

    // Check permissions
    if (existing.creatorId !== user.id && user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Optimistic locking
    if (version !== undefined && existing.version !== version) {
      return Response.json({ error: "Inventory has been modified. Please refresh." }, { status: 409 });
    }

    // Update
    const inventory = await prisma.inventory.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(image !== undefined && { image }),
        ...(tags && { tags }),
        ...(isPublic !== undefined && { isPublic }),
        version: { increment: 1 },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return Response.json({ inventory });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return Response.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}

// DELETE inventory
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inventory = await prisma.inventory.findUnique({
      where: { id: params.id },
    });

    if (!inventory) {
      return Response.json({ error: "Inventory not found" }, { status: 404 });
    }

    // Check permissions
    if (inventory.creatorId !== user.id && user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.inventory.delete({
      where: { id: params.id },
    });

    return Response.json({ message: "Inventory deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    return Response.json({ error: "Failed to delete inventory" }, { status: 500 });
  }
}
