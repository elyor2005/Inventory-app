import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get all public inventories and their tags
    const inventories = await prisma.inventory.findMany({
      where: {
        isPublic: true,
      },
      select: {
        tags: true,
      },
    });

    // Flatten and count tags
    const tagCounts: Record<string, number> = {};
    inventories.forEach((inv) => {
      inv.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Convert to array and sort by count
    const tags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30); // Top 30 tags

    return Response.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return Response.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}
