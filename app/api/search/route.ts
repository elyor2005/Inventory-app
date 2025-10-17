import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all"; // 'all', 'inventories', 'items'
    const category = searchParams.get("category") || "";
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!query.trim()) {
      return Response.json({ results: [] });
    }

    const searchTerm = query.trim();
    const results: Array<{
      type: "inventory" | "item";
      id: string;
      name: string;
      description?: string;
      category?: string;
      tags?: string[];
      inventoryId?: string;
      inventoryName?: string;
      createdAt: Date;
    }> = [];

    // Search Inventories
    if (type === "all" || type === "inventories") {
      const inventories = await prisma.inventory.findMany({
        where: {
          AND: [
            {
              OR: [{ creatorId: user.id }, { isPublic: true }, { allowedUsers: { has: user.id } }],
            },
            {
              OR: [{ title: { contains: searchTerm, mode: "insensitive" } }, { description: { contains: searchTerm, mode: "insensitive" } }, { tags: { hasSome: [searchTerm] } }],
            },
            ...(category ? [{ category }] : []),
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          
          tags: true,
          createdAt: true,
        },
        take: limit,
      });

      results.push(
        ...inventories.map((inv) => ({
          type: "inventory" as const,
          id: inv.id,
          name: inv.title,
          description: inv.description,
          category: inv.category,
          tags: inv.tags,
          createdAt: inv.createdAt,
        }))
      );
    }

    // Search Items
    if (type === "all" || type === "items") {
      const items = await prisma.item.findMany({
        where: {
          AND: [
            {
              OR: [{ name: { contains: searchTerm, mode: "insensitive" } }, { tags: { hasSome: [searchTerm] } }],
            },
            {
              inventory: category
                ? { category }
                : {
                    OR: [{ creatorId: user.id }, { isPublic: true }, { allowedUsers: { has: user.id } }],
                  },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          tags: true,
          inventoryId: true,
          createdAt: true,
          inventory: {
            select: {
              title: true,
              category: true,
            },
          },
        },
        take: limit,
      });

      results.push(
        ...items.map((item) => ({
          type: "item" as const,
          id: item.id,
          name: item.name,
          tags: item.tags,
          inventoryId: item.inventoryId,
          inventoryName: item.inventory.title,
          category: item.inventory.category,
          createdAt: item.createdAt,
        }))
      );
    }

    // Sort by relevance (exact matches first, then by date)
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchTerm.toLowerCase();
      const bExact = b.name.toLowerCase() === searchTerm.toLowerCase();

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return Response.json({
      results: results.slice(0, limit),
      total: results.length,
      query: searchTerm,
    });
  } catch (error) {
    console.error("Error searching:", error);
    return Response.json({ error: "Failed to search" }, { status: 500 });
  }
}
