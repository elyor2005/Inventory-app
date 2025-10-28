import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get latest 10 inventories that are public or accessible
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
        createdAt: "desc",
      },
      take: 10,
    });

    return Response.json({ inventories });
  } catch (error) {
    console.error("Error fetching latest inventories:", error);
    return Response.json({ error: "Failed to fetch latest inventories" }, { status: 500 });
  }
}
