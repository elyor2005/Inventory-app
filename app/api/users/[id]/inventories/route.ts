import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

// GET - Get user's owned and accessible inventories
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Get owned inventories
    const ownedInventories = await prisma.inventory.findMany({
      where: { creatorId: id },
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

    // Get accessible inventories (where user has been granted access)
    const accessibleInventories = await prisma.inventory.findMany({
      where: {
        AND: [
          { allowedUsers: { has: id } },
          { creatorId: { not: id } }, // Exclude owned inventories
        ],
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

    return Response.json({
      user,
      ownedInventories,
      accessibleInventories,
    });
  } catch (error) {
    console.error("Error fetching user inventories:", error);
    return Response.json(
      { error: "Failed to fetch user inventories" },
      { status: 500 }
    );
  }
}
