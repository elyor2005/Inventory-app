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
    const { title, description, category, image, tags, isPublic } = body;

    console.log("Creating inventory:", { title, category, userId: user.id });

    // Validation
    if (!title || !description || !category) {
      return Response.json({ error: "Title, description, and category are required" }, { status: 400 });
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
        customFields: [],
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
