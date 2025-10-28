/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

// POST - Create new item
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inventory = await prisma.inventory.findUnique({
      where: { id },
      select: {
        id: true,
        creatorId: true,
        isPublic: true,
        allowedUsers: true,
        customIdFormat: true,
      },
    });

    if (!inventory) {
      return Response.json({ error: "Inventory not found" }, { status: 404 });
    }

    // Check permissions
    const canAdd = inventory.creatorId === user.id || user.role === "admin" || inventory.isPublic || inventory.allowedUsers.includes(user.id);

    if (!canAdd) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, tags, customFieldValues } = body;

    if (!name) {
      return Response.json({ error: "Item name is required" }, { status: 400 });
    }

    // Generate custom ID if enabled
    let customId = null;
    const idFormat = inventory.customIdFormat as any;

    if (idFormat && idFormat.enabled) {
      // Use new ID generation system if elements exist
      if (idFormat.elements && idFormat.elements.length > 0) {
        const { generateCustomId, hasSequenceElement } = await import("@/lib/customIdGenerator");
        customId = generateCustomId(idFormat);

        // Update sequence counter if format uses sequence
        if (hasSequenceElement(idFormat)) {
          await prisma.inventory.update({
            where: { id },
            data: {
              customIdFormat: {
                ...idFormat,
                sequenceCounter: (idFormat.sequenceCounter || 1) + 1,
              },
            },
          });
        }
      } else {
        // Fallback to old format for backwards compatibility
        const counter = (idFormat.currentCounter || idFormat.counterStart || 1).toString().padStart(idFormat.counterPadding || 3, "0");
        customId = `${idFormat.prefix || ""}${counter}${idFormat.suffix || ""}`;

        await prisma.inventory.update({
          where: { id },
          data: {
            customIdFormat: {
              ...idFormat,
              currentCounter: (idFormat.currentCounter || idFormat.counterStart || 1) + 1,
            },
          },
        });
      }
    }

    // Organize custom field values by type
    const stringValues: any = {};
    const textValues: any = {};
    const integerValues: any = {};
    const dateValues: any = {};
    const booleanValues: any = {};

    if (customFieldValues) {
      // Get inventory custom fields to determine types
      const inv = await prisma.inventory.findUnique({
        where: { id },
        select: { customFields: true },
      });

      const customFields = (inv?.customFields as any[]) || [];

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

    const item = await prisma.item.create({
      data: {
        name,
        tags: tags || [],
        customId: customId, // Persist the generated custom ID
        inventoryId: id,
        creatorId: user.id,
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

    return Response.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return Response.json({ error: "Failed to create item: " + (error as Error).message }, { status: 500 });
  }
}

// GET - List items in inventory
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const inventory = await prisma.inventory.findUnique({
      where: { id },
      select: {
        id: true,
        isPublic: true,
      },
    });

    if (!inventory) {
      return Response.json({ error: "Inventory not found" }, { status: 404 });
    }

    const items = await prisma.item.findMany({
      where: { inventoryId: id },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({ items });
  } catch (error) {
    console.error("Error fetching items:", error);
    return Response.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}
