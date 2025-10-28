import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

// GET - Search users by name or email (for autocomplete)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query.trim()) {
      return Response.json({ users: [] });
    }

    const searchTerm = query.trim();

    // Search users by name or email
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { email: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
          // Don't show blocked users
          { blocked: false },
          // Don't show current user in results
          { id: { not: user.id } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: limit,
      orderBy: {
        name: "asc",
      },
    });

    return Response.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return Response.json({ error: "Failed to search users" }, { status: 500 });
  }
}
