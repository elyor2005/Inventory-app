import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get top 5 most popular inventories by item count
    const inventories = await prisma.inventory.findMany({
      where: {
        isPublic: true,
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
        items: {
          _count: "desc",
        },
      },
      take: 5,
    });

    return Response.json({ inventories });
  } catch (error) {
    console.error("Error fetching popular inventories:", error);
    return Response.json({ error: "Failed to fetch popular inventories" }, { status: 500 });
  }
}
