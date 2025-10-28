import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

// GET single inventory
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const inventory = await prisma.inventory.findUnique({
      where: { id },
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
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, image, tags, isPublic, customFields, customIdFormat, allowedUsers, version } = body;

    // Get existing inventory
    const existing = await prisma.inventory.findUnique({
      where: { id },
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

    // Validate custom fields if provided
    if (customFields && Array.isArray(customFields)) {
      const invalidFields = customFields.filter((f: { label?: string }) => !f.label || !f.label.trim());
      if (invalidFields.length > 0) {
        return Response.json({ error: "All custom fields must have labels" }, { status: 400 });
      }

      const fieldCounts = customFields.reduce((acc: Record<string, number>, field: { type: string }) => {
        acc[field.type] = (acc[field.type] || 0) + 1;
        return acc;
      }, {});

      for (const [type, count] of Object.entries(fieldCounts)) {
        if ((count as number) > 3) {
          return Response.json({ error: `Maximum 3 fields allowed per type. Found ${count} fields of type ${type}` }, { status: 400 });
        }
      }
    }

    // Update
    const inventory = await prisma.inventory.update({
      where: { id },
      data: {
        title,
        description,
        category,
        image: image || null,
        isPublic: isPublic !== undefined ? isPublic : existing.isPublic,
        tags: tags || existing.tags,
        customFields: customFields || existing.customFields,
        customIdFormat: customIdFormat || existing.customIdFormat,
        allowedUsers: allowedUsers !== undefined ? allowedUsers : existing.allowedUsers,
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
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inventory = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!inventory) {
      return Response.json({ error: "Inventory not found" }, { status: 404 });
    }

    // Check permissions
    if (inventory.creatorId !== user.id && user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.inventory.delete({
      where: { id },
    });

    return Response.json({ message: "Inventory deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    return Response.json({ error: "Failed to delete inventory" }, { status: 500 });
  }
}
