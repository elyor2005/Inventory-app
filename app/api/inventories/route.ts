import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

// GET all inventories for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inventories = await prisma.inventory.findMany({
      where: {
        OR: [{ creatorId: user.id }, { allowedUsers: { has: user.id } }],
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
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return Response.json({ inventories });
  } catch (error) {
    console.error("Error fetching inventories:", error);
    return Response.json({ error: "Failed to fetch inventories" }, { status: 500 });
  }
}

// POST create new inventory
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, image, tags, isPublic, customFields } = body;

    console.log("Creating inventory:", { title, category, userId: user.id, customFieldsCount: customFields?.length || 0 });

    // Validation
    if (!title || !description || !category) {
      return Response.json({ error: "Title, description, and category are required" }, { status: 400 });
    }

    // Validate custom fields if provided
    if (customFields && Array.isArray(customFields)) {
      const invalidFields = customFields.filter((f: any) => !f.label || !f.label.trim());
      if (invalidFields.length > 0) {
        return Response.json({ error: "All custom fields must have labels" }, { status: 400 });
      }

      // Count fields by type
      const fieldCounts = customFields.reduce((acc: any, field: any) => {
        acc[field.type] = (acc[field.type] || 0) + 1;
        return acc;
      }, {});

      // Check max 3 per type
      for (const [type, count] of Object.entries(fieldCounts)) {
        if ((count as number) > 3) {
          return Response.json({ error: `Maximum 3 fields allowed per type. Found ${count} fields of type ${type}` }, { status: 400 });
        }
      }
    }

    const inventory = await prisma.inventory.create({
      data: {
        title,
        description,
        category,
        image: image || null,
        isPublic: isPublic || false,
        tags: tags || [],
        creatorId: user.id,
        customFields: customFields || [],
        customIdFormat: [],
        allowedUsers: [],
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

    console.log("Inventory created:", inventory.id);

    return Response.json({ inventory }, { status: 201 });
  } catch (error) {
    console.error("Error creating inventory:", error);
    return Response.json({ error: "Failed to create inventory: " + (error as Error).message }, { status: 500 });
  }
}
