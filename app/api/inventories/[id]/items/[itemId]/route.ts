/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

// GET single item
export async function GET(_request: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: params.itemId },
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

    if (!item || item.inventoryId !== params.id) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    return Response.json({ item });
  } catch (error) {
    console.error("Error fetching item:", error);
    return Response.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

// PATCH update item
export async function PATCH(request: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const item = await prisma.item.findUnique({
      where: { id: params.itemId },
      include: {
        inventory: {
          select: {
            creatorId: true,
            customFields: true,
          },
        },
      },
    });

    if (!item || item.inventoryId !== params.id) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    // Check permissions
    const canEdit = item.inventory.creatorId === user.id || user.role === "admin";

    if (!canEdit) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, tags, customFieldValues } = body;

    // Organize custom field values by type
    const stringValues: any = {};
    const textValues: any = {};
    const integerValues: any = {};
    const dateValues: any = {};
    const booleanValues: any = {};

    if (customFieldValues) {
      const customFields = (item.inventory.customFields as any[]) || [];

      customFields.forEach((field) => {
        const value = customFieldValues[field.name];
        if (value !== undefined && value !== null && value !== "") {
          switch (field.type) {
            case "string":
              stringValues[field.name] = value;
              break;
            case "text":
              textValues[field.name] = value;
              break;
            case "integer":
              integerValues[field.name] = parseInt(value);
              break;
            case "date":
              dateValues[field.name] = value;
              break;
            case "boolean":
              booleanValues[field.name] = Boolean(value);
              break;
          }
        }
      });
    }

    const updatedItem = await prisma.item.update({
      where: { id: params.itemId },
      data: {
        name: name || item.name,
        tags: tags !== undefined ? tags : item.tags,
        stringValues: Object.keys(stringValues).length > 0 ? stringValues : null,
        textValues: Object.keys(textValues).length > 0 ? textValues : null,
        integerValues: Object.keys(integerValues).length > 0 ? integerValues : null,
        dateValues: Object.keys(dateValues).length > 0 ? dateValues : null,
        booleanValues: Object.keys(booleanValues).length > 0 ? booleanValues : null,
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

    return Response.json({ item: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    return Response.json({ error: "Failed to update item" }, { status: 500 });
  }
}

// DELETE item
export async function DELETE(request: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const item = await prisma.item.findUnique({
      where: { id: params.itemId },
      include: {
        inventory: {
          select: {
            creatorId: true,
          },
        },
      },
    });

    if (!item || item.inventoryId !== params.id) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    // Check permissions
    const canDelete = item.inventory.creatorId === user.id || user.role === "admin";

    if (!canDelete) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.item.delete({
      where: { id: params.itemId },
    });

    return Response.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return Response.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
